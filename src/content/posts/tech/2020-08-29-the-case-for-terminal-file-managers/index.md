---
title: The Case for Terminal File Managers
tags: [educational]
thumbnail:
  path: thumbnail.jpg
  position: 0px 15%
  source:
    link: https://www.reddit.com/r/ManjaroLinux/comments/dz3ra2/i_madea_4k_wallpaper_for_you_guys_that_looks_like/
    title: source
---
A file manager is a program that lets you interact with a file-system. A filesystem
is the abstraction used by your OS to expose the data stored on your computer (in a
hard drive, a virtual partition etc.) or any external devices (such as a memory
stick). Most users will really only be familliar with large, graphical file managers
such as windows [file explorer][wfe] or on linux, [GNOME Files][gnomef] or
[Konqueror][kde_q] (more recently [KDE dolphin][kde_d]). Personally I use a mixture
of dolphin and a terminal file manager called [lf][lf].

[wfe]: https://en.wikipedia.org/wiki/File_Explorer
[gnomef]: https://en.wikipedia.org/wiki/GNOME_Files
[kde_q]: https://en.wikipedia.org/wiki/Konqueror
[kde_d]: https://en.wikipedia.org/wiki/Dolphin_(file_manager)

The advantages of a graphical file manager are numerous; extended key support, tabs,
dialogs for file transfers, automatic device mounting etc. However in this post, I'd
like to explain why even users of dolphin (or the plethora of other such graphical
file managers) could benefit from a textual interface from time to time :grin:.

[lf]: https://github.com/gokcehan/lf

<style>
/*
.control-bar {
    visibility: hidden;
}
*/
</style>

## Speed
> lf is fast. It's insanely fast.

{{< asciinema key="./startup-time.cast" preload="true" >}}

The actual startup time generally varies depending on the speed of the device you're
current working directory is in, but there's very little latency from the file
manager itself. In comparison dolphin can take anywhere from 2-10 seconds to startup
for me.

Though startup time isn't the only metric in which `lf` is fast. Moving across the
file system, inputting key commands, cutting and pasting files. Everything is
extremely responsive. Lets try jumping through a symlink to another device.

{{< asciinema key="./jump-symlink.cast" preload="true" >}}

How about previewing a file and then opening the preview in my pager?

{{< asciinema key="./preview-pager.cast" preload="true" >}}

Like with vim, there's very little lag between user input and program output. As you
grow accustomed to it and your hands start to remember your bindings, you become able
to jump through your file system at blazing speed.

## Seperation of Concerns
The single best part about terminal file managers is that they're minimalist but
extensible. Meaning out of the box, they generally don't come with very many builtin
commands or operations, but give you the ability to extend and build on them. This
lets you chain different programs together to improve your user experience.

### Fuzzy Jump
Lets try using `fzf` to jump to this file in my blogs repository

{{< asciinema key="./fzf-jump.cast" preload="true" >}}

There's a few cool concepts at play here.
1. `fzf` is being spawned as a subprocess of my `lf` client, however `lf` lets me
   supersede control to it. All input is being redirected to `fzf` and the `lf`
   output is essentially hidden until the subprocess finishes
2. `fzf` is **respecting** my *.gitignore* file. I can't fuzzy jump to a file in my
   *node_modules* or *vendor* directory. I have a seperate command designed to let my fuzzy
   jump to all files, but the default one only lets me jump to project files.
3. `fzf` shows file previews as well. I'm sharing the same preview script between
   `fzf` and `lf` so there's less of an interface shock when using the command.

It's worth mentioning that none of this is built into `lf`, you have to program them
yourself, meaning you can shape the experience you want.

### Bulkrename
This is the most valuable, most useful, most essential part of my setup. `bulkrename`
is a command I initially encountered in [ranger][ranger]. I missed it so much when I
moved to `lf` that I created [my own script][bulkrename] to emulate it. It works by
opening a file list in the editor of your choice, and then runs a few different
commands depending on how you modify the file.

[ranger]: https://github.com/ranger/ranger
[bulkrename]: https://github.com/mohkale/.dotfiles/blob/7bc6a78c9f6147fcbc58a3543285e9e96b17d282/bin/bulkrename

Let's say I have a bunch of video files with a prefix indicating where I got them
from, but I don't care about that so I'd like to remove it. In the old days I'd
probably have written a script (or a very long command line) to read each file and
then process them. With `lf` I can do it in under a minute.

{{< asciinema key="./bulkrename.cast" preload="true" >}}

Here I've:
1. selected all files with a `.mkv` extension,
2. ran the `bulkrename` command on them to open a file list,
3. removed the vendor prefix (`[HorribleSubs] `) from all files,
4. renamed the `-` seperator to `EP`,
5. changed the resolution indicator (`[1080p]` to `.1080p.`)

**All in under a minute**.

steps 1 and 2 were done in `lf`, whereas the remaining steps where done in `vim`. For
step 3 I used visual-block-mode to select and remove the prefix. The last two steps I
executed using a vim [macro][vi_macro] (a way to record and repeat keypresses) which
was required because of how each line had a different length.

[vi_macro]: https://vim.fandom.com/wiki/Macros

What I wanted to show with this example was how efficiently I was able to go from
intention to goal. It took under a minute to batch process over 100 files. Why? The
seperation of concerns. `lf` is a good file manager, all the file selection and file
system related operations were done in it. `vim` is a good text editor, all the
modifying file names and user interaction was done from it.

Terminal file managers hook into the unix philosophy of *do one thing and do it well*
exceptionally. My editor is good at editing text, so use it to rename and modify
file names. My file manager is good at showing me and letting me select files, so let
it do that. **Each thing does what it does well and you get a highly efficient workflow.**

### Grouping Files
Bulkrename isn't limited to simply renaming, my script exposes the commands for
movement and deletion as simple shell functions, which the user can modify to do
with as they will. Let's say I have a bunch of numbered folders and I'd like to
group them into 10s.

{{< asciinema key="./bulkrename-group.cast" preload="true" >}}

Here I have a bunch of numbered directories and I've simply grouped them into a
folder matching the 10s digit of the number. Admittedly I've relied on all the folders
having a number in the same place and of the same width, but for more unstructured
data you can always resort to a macro or even a subshell. Linux is extremely flexible
in how it lets you approach problems like this.

## A Practical Application
Bulkrenaming itself is pretty practical, but I thought it'd be cool to end with a
demonstration of how I use `lf` all the time.

Not to toot my own horn, but I'm an avid manga reader; I have a vast ~~somewhat
oversized :sweat_smile:~~ collection of manga in *.cbz* or *.cbr* format. Ocassionally I scrape
chapters from mangasites, or download digital releases, but at the end of the day I
like to read it on my phone. There are apps for reading *.cbz* or *.cbr* files, but
I've yet to encounter a better reader for iOS than adobe acrobat. So I've taken to
batch converting manga to PDFs and then sharing them to my phone. As a practical
example, let's demonstrate how I do that.

I have a [script][img2pdf] which reads in paths to image files and then lazily builds
a *.pdf* file from them. I had to rely on python and use an external dependency
because literally **EVERY** script or processor I encountered ~~I really only tried
imagemagick and some other scripts I found online~~ to do so ended up keeping the
entire PDF file in memory; which even for small volumes lead to my computer crashing.
My script uses [pillow][pillow] and a not very well documented feature of it that
lazily appends images to a PDF. The trade off is that it has to open the PDF file for
every image it writes, which for PDFs with 100s of images starts to slow down
immensely but I prefer this to crashing.

[pillow]: https://pillow.readthedocs.io/en/stable/
[img2pdf]: https://github.com/mohkale/.dotfiles/blob/310148402a86987ce3a7d3561975baa93122db7c/bin/img2pdf

So here's what we're gonna do. We're gonna use `lf` to select a few volumes we want
to read now, we'll find all images in each volume, make sure their ordered correctly
and then pass them to my script to turn them into a PDF, which we'll save with the
same name as the volume in a subdirectory and with a *.pdf* extension.

{{< asciinema key="./img2pdf.cast" preload="true" >}}

**NOTE**: for the sake of this demonstration I've truncated each volume down to just
10 images. In practice I generally do this with upwords of 100-200 images at once.
However that would've taken too long.

So to summarise:
- I used `lf` to select the two volumes I want to convert.
- I create an inline script to iterate for each selected volume.
- I found each file in each volume, sorted them and then passed them to `img2pdf`.
- Then I finally trashed the original volume directory because it's no longer
  necessary.

**NOTE**: At the end I manually created the *out* directory and moved the *.pdf* into
there. I could've done so in the script itself, but I'd have to parse out the volumes
basename first, which seemed like too much of a hassle for this demo.

## Conclusions
To conclude there isn't much else to say, aside from

> Terminal File Managers are Awesome!

If you spend a lot of time fussing around with files and collections, or navigating
through a filesystem. It really helps to have an interface to that file system that's
closely tied to your shell. I highly recommend looking through some of the different
file managers out there. A good introductory one would have to be [ranger][ranger].
It's written in python and has a plugin system related to python modules. [nnn][nnn]
is also a well liked file manager (although I've never been much attracted to it).

[nnn]: https://github.com/jarun/nnn

[lf][lf] is the file manager I've been using in these examples. It has an unorthodox
config format; I'd decribe it as a strange mix of vimlang and kakoune, but I'm quite
fond of how simple it is to extend. Shell scripts are inherently designed to plug
different programs together and being able to do that in your file manager is amazing.

To finish, here's a link to all the scripts I've used in this post and my `lf`
[config][lf_config] file.
- [bulkrename][bulkrename]
- [img2pdf](https://github.com/mohkale/.dotfiles/blob/390ec238e082fea0496b60c446f5314ac1f034ec/bin/preview)
- [img2pdf][img2pdf]
- [condemn](https://github.com/mohkale/.dotfiles/blob/master/bin/condemn)

[lf_config]: https://github.com/mohkale/.dotfiles/blob/7bc6a78c9f6147fcbc58a3543285e9e96b17d282/programs/lf/lfrc
