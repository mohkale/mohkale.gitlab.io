---
title: Soak up Pipelines with sponge
thumbnail:
  path: thumbnail.jpg
---

While migrating my `vipe` script from [perl][vipe_perl] to [python][vipe_python], I
had the chance to look into more of the programs in the [moreutils][mu] project. While
there were a few that seemed really useful, [`sponge`][sponge] is far and away the most
practical utility I've seen. In this post lets explore the issues and applications of
the `sponge` utility.

[sponge]: https://manpages.debian.org/testing/moreutils/sponge.1.en.html
[mu]: https://joeyh.name/code/moreutils/
[vipe_perl]: https://github.com/madx/moreutils/blob/5ca552dd82dc3ef5ee0d388716148c5a653b72bb/vipe
[vipe_python]: https://github.com/mohkale/dotfiles/blob/a31305d025581dc7ead55d81e153718078604732/bin/vipe

## Accidentally Truncating Files
`sponge` addresses a common use case when working with a shell pipeline: **modifying
files in place**. For example:

```sh
sed --in-place 's/bar/baz/g' foo.txt
```

This opens the file *foo.txt*, replaces each occurrence of `bar` with `baz` on each
line and then saves the changes back to the *foo.txt*. The default behaviour of `sed`
is to output whatever modifications it does to the file back to stdout, however the
`--in-place` flag makes it save those changes back to the opened files instead.
Quite often whatever stream editor you're using (`sed`, `awk`, `perl`) has a flag
like this to modify a file in place. However what about when this isn't an option?
Most beginners generally try to do this:

```sh
cat foo.txt | sed 's/bar/baz/' > foo.txt
```

{{< notify "error" "But **DON'T**. This doesn't modify the file, *foo.txt*, in place; It truncates/erases it." >}}

To explain, we're outputting the contents of the file *foo.txt* (with `cat foo.txt`),
editing it with `sed` (`sed 's/bar/baz/'`), before finally redirecting the changes
back to *foo.txt* (`> foo.txt`). The issue is that when you redirect to a file, your
shell will open the file in write mode, erasing its previous contents. Then by the
time `cat foo.txt` gets started you'll be reading from an empty file. In essence you
tried to modify a file and you instead erased it.

I'm sad to admit that this issue has bitten me in the back at least twice （＞д＜）. I always
try to keep backups and nowadays I avoid redirecting with `>` because of how
dangerous this is. If you have to use the previous approach you should redirect
elsewhere and then save the changes back. It also helps to delete any temporary files
you make when you're done.

```sh
cat foo.txt | sed 's/bar/baz/' > foo2.txt && mv -f foo2.txt foo.txt || rm foo2.txt
```

This works... but it's needlessly wordy and too cumbersome to have to type each time
you have to do something as simple as edit a file in a pipeline. Luckily moreutils
`sponge` gives you a much nicer approach for problems like this.

## Sponge
Like it's namesake, `sponge` is a command that soaks in its input before writing it
back out. If one of the commands in the pipeline fails then a broken pipe error
(errno 32) will be sent to `sponge` and it won't end up writing to anything.
Otherwise it'll wait until it's input is finished and then write it out.

Our earlier example becomes:

```sh
cat foo.txt | sed 's/bar/baz/ | sponge foo.txt
```

One extra command in the pipeline and we can save ourselves the hassle of maintaining
temporary state and error handling.

## When to Not Use Sponge
Frankly a more important discussion than when **to** use sponge, is when **not to**
use it.

Generally you'll never want to use it when a builtin option will get you the same
affect. `sed` has an option for editing files in place so you'll rarely ever want
to use `sponge` with `sed`. Why do `sed 's/bar/baz/' foo.txt | sponge foo.txt` when
`sed -i 's/bar/baz/' foo.txt` will suffice?

Of course there's some situations in which it makes sense. The most common would
probably be when you'd like to build up a complex edit rather then incrementally
apply commands. For example:


```sh
sed -i 's/bar/baz/' foo.txt
sed -i 's/foo/bag/' foo.txt
sed -i 's/bingle/bangle/' foo.txt
```

{{< notify "note" "In this case `sed` **can** accept multiple expression For demonstration purposes I've divided them into 3 seperate commands." >}}

Any one of these commands could fail and you end up in the unenviable position of
trying to backtrack through them to see which one failed and why? You then have to
reset the file to a state where you can apply the command again and get your desired
affect. In this case it's pretty straightforward because each is a simple edit and
none of them interfere with each other, but for more complex edits this can become a
serious headache.

`cmd | sponge file`, on the other hand, has the added benefit that if any `cmd`
before `sponge` in the pipeline fails, nothing will happen to `file`.

```sh
sed 's/bar/baz/' foo.txt |
  sed 's/foo/bag/' |
  sed 's/bingle/bangle/' |
  sponge foo.txt
```

now `foo.txt` will stay unmodified if any command leading up to it fails, otherwise
we'll get the changes we want.

# Conclusion
This has been a brief but useful introduction to the [`sponge`][sponge] command, I
recommend using this as an opportunity to explore some of the other cool commands in
the [moreutils][mu] project. There's honestly some great utilities (eg. [ifne][ifne]) which admittedly
you'll rarely find a use for; but when you do you'll be grateful they exist.

[ifne]: https://linux.die.net/man/1/ifne
