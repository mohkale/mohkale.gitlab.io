---
title: Using fzf as a dmenu Replacement
meta:
  title: {"display": "Using fzf Instead of dmenu"}
  post: true
  comments: true
  anchor_links: true

tags:
  - fundamentals
  - shell

thumbnail:
  path: screenshot.jpg
  caption: You can find the final fzf-dmenu script
  source:
    link: https://github.com/mohkale/.dotfiles/blob/7bc6a78c9f6147fcbc58a3543285e9e96b17d282/desktop/xorg/scripts/fzf-dmenu
    title: here
---

A while back I read a [post][orig] by *Ömür Özkir* about using [fzf][fzf] as a
replacement for [dmenu][dmenu]. For those that're unfamiliar.

[orig]: https://medium.com/njiuko/using-fzf-instead-of-dmenu-2780d184753f
[ls_vid]: https://www.youtube.com/watch?v=R9m723tAurA
[fzf]: https://github.com/junegunn/fzf
[dmenu]: https://tools.suckless.org/dmenu/

dmenu is an application dispatcher. It pops up with a bunch of options for you to
choose and then does something with them. It's commonly configured to pop up with a
list of the programs installed on your system and then starts the program you select.
Luke Smith made an excellent [video][ls_vid] about dmenu, I highly recommend checking
it out.

fzf is a command line fuzzy finder. It takes a bunch of possible choices from stdin
and outputs chosen ones to stdout. This isn't too dissimilair from dmenu except fzf
can only be run from a terminal and it doesn't automatically make a window to show
options like dmenu.

In Ömür's [post][orig] he outlined how he used the users `PATH` variable to find a
bunch available executables, pass them to fzf to have the user select one and then
started the chosen programs. He described it as a dmenu replacement and I really
liked his solution.

## Too Permissive
{{< figure src="./default.jpg" caption="Observe over 4000 programs." class="full-width-when-small stack-left" width="240px" >}}

However I did find one minor issue with Ömür's implementation. Not all programs you
can spawn from the command line are supposed to be run interactively.

Ömür's approach simply offered every executable in your `PATH`. So some programs like
`python` would crash immeadiately if you select them. It even offers innocuous shell
builtins such as `[` or `test` as candidates when there's no real chance you'll ever
want to use them in this context.

## Let's Fix That
{{< figure src="./with-xdg.jpg" caption="Observe only 150 programs." class="full-width-when-small stack-right" width="240px" >}}

So how do you discern interactive from non-interactive programs? How does my Desktop
Environment do it? Well as it happens, unix like systems have adopted the [XDG
directory specification][dirspec] as a standard for configuring executables. So a
reasonable way to shrink the number of available candidates would be to only offer
programs that have associated *.desktop* entries.

[dirspec]: https://specifications.freedesktop.org/desktop-entry-spec/latest/index.html#introduction

It's not that straightforward however. The XDG spec also specifies how to spawn them
programs. There's an entire [section][Exec] in the spec dedicated to special format
codes used to construct the command line for a program. After some trial and error I
finally got a [fzf-dmenu][fzf-dmenu] that I'm happy with, so I think it's about time
to share it with the world :joy:.

[Exec]: https://specifications.freedesktop.org/desktop-entry-spec/latest/ar01s07.html
[fzf-dmenu]: https://github.com/mohkale/.dotfiles/blob/7bc6a78c9f6147fcbc58a3543285e9e96b17d282/desktop/xorg/scripts/fzf-dmenu

## Side Notes
Unlike Ömür's solution, my implementation doesn't have any logic for spawning
terminals. He used a mixture of `xdotool` and `urxvt` for this, but I didn't think
that sort of logic belonged in the script itself. Mine can be used directly from an
open terminal and the only way to spawn it in a new terminal is to spawn the terminal
first and then run `fzf-dmenu`.

Incidentally I've been using `xbindkeys` for binding keys and I [do have a
script][spawn-term] for creating new terminals and then running programs in them. It
was partially adapted from Ömür's implementation here, except it's designed to work
with my terminal of choice (`st`) instead of `urxvt`.

[spawn-term]: https://github.com/mohkale/.dotfiles/7bc6a78c9f6147fcbc58a3543285e9e96b17d282/master/bin/spawn-term

My implementation also maintains the behaviour of Ömür's original solution (I.E.
offering every executable in your `PATH`). You can toggle it by passing the `-a`
flag to `fzf-dmenu`. It's retained partially for compatibility, but more so in case
you try to spawn an executable that doesn't have an associated *.desktop* file. I
recommend binding `fzf-dmenu` and `fzf-dmenu -a` to two complimentary keys in your
config. For example, I've bound them to `S-[` and `S-]` respectively.

## The Final Script
<style>
  .demo-figure img {
    width: 100%
  }
</style>

{{< figure src="./demo.gif" class="full-main-width-when-small demo-figure" >}}

Another caveat of using fzf is that you can select multiple candidates at once. I'm
not sure whether dmenu offers this, but I really like being able to spawn multiple
related programs at once. I can start `fzf-dmenu`, select my editor, my file browser,
my web browser and start them all at once.

## Future Improvements
There's still one minor issue with this implementation, spawning terminal apps (such
as vim). The XDG spec says you can attach a `Terminal=true` section to your
`.desktop` files to indicate that they should be run in a new terminal. When I get a
chance I'll add support for this to my script as well :smile:.
