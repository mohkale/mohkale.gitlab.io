---
title: GNU parallel is xargs on Steroids
thumbnail:
  path: thumbnail.jpg
  source:
    link: https://www.spie.ch/de/angebot/it-solutions/datacenter/
---

Lets talk about `xargs`. It's useful, reliable and **far too inflexible**.

## What is xargs?

For those that're unfamiliar, `xargs` is a POSIX program that's used to build
command lines. You produce some output (or supply a text file) and each line of that
output is substituted into a command line and then evaluated. For example, if I have
a list of urls in a file *foo.txt*:

```text
https://foo.com/bar
https://foo.com/baz
https://foo.com/bag
```

and I'd like to download all of them with curl, I can run:

```sh
cat foo.txt | xargs curl
```

For debugging try running `cat foo.txt | xargs echo curl`, it should output:

```sh
curl https://foo.com/bar https://foo.com/baz https://foo.com/bag
```

`xargs` has taken each line of input appended to the end of our `echo` command and
then run the command (which is why the command line is outputted without an `echo `
prefix). Now under the hood `xargs` has a bunch of different (highly useful) options,
but this should give a high level overview of what it does. Read a file, build a
command-line, run the command. It also automatically starts a new command whenever a
command line gets too long (which would normally cause it to crash). 

The main options of `xargs` that're worth mentioning include:

| Flag | Argument    | Description                                                                 |
|:----:|:-----------:|:----------------------------------------------------------------------------|
| `-r` |             | Don't run any command if the input file supplies no arguments               |
| `-d` | `DELIMETER` | Treat DELIMITER as the seperator between arguments [1]                      |
| `-I` | `PATTERN`   | Replace each occurrence of pattern in the command line with an argument [2] |
| `-a` | `FILE`      | Read arguments from `FILE` instead of standard input                        |

**[1]**: by default `xargs` has some weird issues with quotes in the arguments, that's
why it's recommended to use the `\0` delimiter with the input (eg. `find -print0`)
however with the `-d` flag set to `\n` you can get the same behaviour with just
regular newlines.

**[2]**: In the curl example above it's OK to just append arguments to the end
of the command but if you need more flexibility you can prepend arguments to it
as well (eg. `xargs -I {} python3 {} --shared-flag`)

{{< notify "warn" "The `-I` flag only supports substituting one argument into the command line at a time." >}}

## The Need for Parallel
So that's `xargs`, why do you need `parallel`?

### Exec vs. System
`xargs` always uses the `exec` system-call for running a sub-command. Meaning it can
only run a single process directly. So say you'd like to run multiple programs on the
input:

```sh
xargs -r -d '\n' -I{} -a urls.txt \
  curl -LO {} ';' echo "Finished downloading" {}
```

Here I've tried to `curl` a URL and then echo out that it has finished. If you
substituted `{}` for each line in `urls.txt` and then tried to run it in your shell
this would probably work... but not with `xargs`. Instead of running two commands
`curl -LO URL` and `echo "Finished downloading" URL` `xargs` will instead run a
single `curl` command with the arguments `-LO URL ; echo "Finished downloading" URL`.

There're ways to get around this. You can spawn a subshell directly:

```sh
xargs -r -d '\n' -I{} -a urls.txt \
  sh -c "curl -LO {}; echo 'Finished downloading' {}"
```

Now we can run multiple commands; of course there're clear issues with what to do
when our current argument `{}` needs to be quoted or contains an unescaped shell
expression. Not to mention the headache of building more complex command lines with
multiple levels of quoting.

For example if the program you're reading arguments from contained something your
shell can evaluate, it'll evaluate it **with** your user permissions.

```sh
echo -e '`echo foobar; DO-SOMETHING-BAD`' |
  xargs -r -d '\n' -I{} \
    sh -c 'echo curl {}; echo "Finished downloading" {}'
```

This tries to download the URL `foobar` but lets the supplying program basically
include any arbitrary expression they want.

`parallel` on the other hand has a few key differences. Firstly `parallel` **always**
spawns a subshell and by default always quotes any arguments. That means you can
include multiple expressions in the final command line and not have to worry about
quoting:

```sh
echo -e '`echo foobar; DO-SOMETHING-BAD`' |
  parallel curl {} \; echo "Finished downloading" {}
```

I'd argue readability alone justifies using `parallel` exclusively, however also note
that this doesn't cause you to run the subcommand `echo foobar; DO-SOMETHING-BAD`; it
passes it properly escaped directly to `curl` and `echo`, avoiding a **potentially
catastrophic** vulnerability in your scripts.

#### Field Index Expressions and Formatting
Even better `parallel` lets you split input arguments into fields like `awk`. For
example:

```sh
echo -e 'foo:bar\nbaz:bag\nbam:boom' |
  parallel --colsep ':' echo mv {1} {2}
```

Which outputs this:

```sh
mv bam boom
mv baz bag
mv foo bar
```

Each input line is split using the `colsep` argument and can then be accessed using
`{N}` for the N<sup>th</sup> field, beginning from 1. `{}` and `{0}` contains the
entire input expression.

[formats]: https://www.gnu.org/software/parallel/man.html#pod

`parallel` also has a few other neat [substitution][formats] patterns for dealing
with files and URLs specifically:

| Pattern | Description                                        |
|:-------:|:---------------------------------------------------|
| `{.}`   | The argument without the file extension            |
| `{/}`   | The basename of the argument                       |
| `{//}`  | The dirname of the argument                        |
| `{/.}`  | The basename of the argument without the extension |

### Concurrent Execution
It isn't called `parallel` without a good reason `（・◇・）`. Both `xargs` and
`parallel` both support running multiple commands simultaneously. Once a command-line is
built the subcommand is then run and `xargs`/`parallel` can move on to building the next
command line until a configurable maximum number of subcommands are running at the same time.
As one command exits the next one can begin until no more need to be created.

By default `xargs` only runs 1 subcommand and `parallel` runs as many commands as the
number of CPU cores we have. You can configure the amount you want running
concurrently with the `--max-procs` flag.

In practice the only real difference between `xargs` and `parallel` here (aside from
the respective defaults behaviour) is how they treat program output.
`xargs` **doesn't**. Whatever the sub-commands print is printed to the current
stdout, even when multiple subcommands try to do so simultaneously. This means your
unlikely to get useful output when running `xargs` with multiple processes.
`parallel` is a little more friendly. The default behaviour is to wait until a
program finishes and then to write its output. This is slow and not good for
long-running commands (for which you'd like to get progress updates).
You can pass the `--line-buffer` flag to make `parallel` output each line from any
subcommand as its printed; preventing cluttered output and maximising usability.
The `--ungroup` flag makes `parallel` treat subcommand output the same as `xargs`.

### Remote Execution
Honestly this feature is probably overkill... but of course I have to talk about it.

> `parallel` lets you outsource the processing of a subcommand to another host.

Remote execution, right from your tiny little computer. All right, to explain
what this means consider for a second that you have an army of tiny computers (eg.
Raspberry-Pi'). Each computer is its own host with its own operating system and
resources. When dealing with file commands `parallel` lets you send the file to one of
these hosts, run the subcommand with it, and then copy back the output (stdout and
maybe files as well) to your localhost.

So say you've got 10,000 little folders you'd like to compress each to their own
archive (`foo/` -> `foo.tar.gz`, `bar/` -> `bar.tar.gz`). Doing that on your own
machine might take a while and slow down your resources but with parallel you can
share the computational cost of this processing across a network of computers.

```sh
find -mindepth 1 -maxdepth 1 -type d |
  parallel --sshlogin hostname --transferfile {} --return {/}.tar --cleanup \
    tar -czvf {/}.tar {}
```

Now in practice this is only for really massive computational problems and even then
the time loss of copying files to and back from a remote host might outweight
whatever benefits you get from it... but **damn that's cool!**.

## Why Use Parallel?
In the end though, if not for all those above features what actual benefit does
parallel bring. In my opinion... it's that its ~~mostly~~ compatible with `xargs`. That
means you can parallelize programs you'd normally run sequentially in a way that
works with parallel but doesn't depend on it.

For example I often use a [script][ls-repos] to find a bunch of repositories on my
system. I specify a list of places I want the script to look at using a `REPO_PATH`
environment variable then run a `find` command on all of them asserting some
condition to confirm whether they are a repository or not. So if I had
`REPO_PATH=$HOME/foo:$HOME/bar` my script will check all the folders inside of
`~/foo` and then all the folders in `~/bar` to see if their repositories.

[ls-repos]: https://github.com/mohkale/dotfiles/blob/b39e1601457568f9ec95e043640c3eccf2419d49/bin/ls-repos

The clear issue with this is `find` doesn't have a nice command-line interface for
`xargs`. You can only add paths to `find` in at the start of the command (eg. `find
PATH1 PATH2 PATH3 -options`). So the classic approach here would be:

```sh
cat paths.txt |
  xargs -r -d '\n' -I{} find {} -options
```

So each path gets its own find process which can result in a lot of find processes
that don't seem necessary (**NOTE**: `-I` and `--max-args` are mutually-exclusive so
you're forced to only ever be able to substitute a single argument). With `parallel`
however you can substitute as many directories for `{}` as you desire (using the `-N`
flag).

```sh
cat paths.txt |
  parallel -N 100 find {} -options
```

This will spawn only one `find` command when the number of paths is less than 100
(and fits into the maximum length of a single command line). Compare this to the
`xargs` equivalent spawning 100 find processes (one for each path).

### Replacing Xargs
Observe that in the previous section there's no need to use exclusively `parallel` or
`xargs`. Because the two share ~~mostly~~ a common interface you can swap `xargs` for
`parallel` in most situations. I do this by checking at the start of my scripts
whether `parallel` is available and then use it (otherwise defaulting to `xargs`).

```sh
batch=(  )
if command -v parallel >/dev/null 2>&1; then
  batch+=( parallel -d '\n' -r -X --line-buffer --quote -N 100 )
else
  batch+=( xargs -d '\n' -r )
fi
```

Now whenever I want to run a command like `xargs` I instead use:

```sh
"${batch[@]}" find {} -print
```

This is a mild performance boost we'll probably never notice but it's nice to know
it's there. Rather than inefficiently spawning `find` processes left, right, and
centre, we now only spawn as many as we need :smile:.

## Conclusion
This has been a brief but informative look at GNU [parallel][par]. Let me know if
there're any other interesting applications or features of `parallel` that you've
found. For those interested in learning more about parallel, checkout the [manual][man].

[par]: https://www.gnu.org/software/parallel/
[man]: https://www.lulu.com/shop/ole-tange/gnu-parallel-2018/paperback/product-23558902.html
