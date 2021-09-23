---
title: Introducing My Brain Dump
thumbnail:
  path: thumbnail.jpg
  source:
    link: https://vk.com/@savannnna-goret-no-ne-sgorat
---

<!-- LocalWords:  TRC BibTex PDFs UI DOI Gitlab
-->

Well, it's been quite a while since my last post. Almost 7 months by my count ｜−・;）.
I'll try to explain this absence in an upcoming post looking back on my time at
university however I think it's about time to update the *little robots* who scrape
this blog with what I've been up to: **My Personal [Brain Dump][brain]**.

[brain]: {{< ref "/brain" >}}

## The Motivation

Near the start of my last year at university I increasingly started to realise the
impracticality of how I took and reviewed notes. My previous process was to write
everything down, by hand, on paper; truly, I'm a Neanderthal (ノ￣ー￣)ノ.
In actuality I had a pretty sophisticated workflow, I timestamped each lecture and
organised by module code. Everything was placed in a single folder but arranged in
such a way that I could easily find or add new entries. It wasn't perfect but it's
what I had been using most of my life so I'd grown accustomed to it.
However this approach had flaws, pretty apparent ones.

1. Carrying around all my notes with me everywhere I went quickly became **impractical**
   as the amount of content I had to learn or review increased.
   At one point I felt like I was carrying bricks worth of paper to-and-from lectures.
1. There's no way to **associate notes to lectures or slides**.
   The most I could do was pad the margin of the pages with references to which
   PowerPoint or slide I should goto to expand on a certain note.
1. My notes weren't index-able or **searchable**.
   For the love of god I'm a computer nerd, how could I accept being unable to `grep`
   something so valuable ヽ(●-`Д´-)ノ.
1. Lastly, and most glaringly, I'm awful at keeping track of my notes after I've written
   them.

An issue that became increasingly apparent to me as I moved from college to university
was how much of what I had learnt had *faded* over time.
For example in my first year at college I had learnt so much about differentiation,
integration and other maths fundamentals. However by my first year at university (2
years later) after I hadn't applied any of that knowledge for so long I found that I
had all but forgotten it. Beyond a vague recollection I would have to actually seek
out and review my notes to truly remember what I had learnt.
This became a common theme by the third year as well when I was learning high level
mathematics related to machine learning and adaptive intelligence.
In the end I saw first-hand how wasteful it was to not properly archive and have
convenient access to the notes I so painstakingly developed.

I suppose the main lesson here was:

> Knowledge that isn't applied, fades.
> Knowledge that is forgotten was never truly learnt.

This was my main motivation for what would eventually become my brain-dump.

## A Prospective Solution: org-mode

So I needed a digital note-taking system. There were a few prospective options. I had
seen some [people][vim-notes] using markdown or [vimwiki][vimwiki] to relative success.
Some more mathematically inclined souls chose latex+vim coming up with jaw-droppingly
efficient [workflows][latex-notes] for note-taking.
However personally I'm not a big fan of how restrictive latex feels for regular
typing, so I would've preferred markdown. Markdown on the other hand is quite sparse
on features and while I could probably come up with something usable by extending the
ordinary syntax I eventually found something far more usable.

[vim-notes]: https://www.edwinwenink.xyz/posts/42-vim_notetaking/
[latex-notes]: https://castel.dev/post/lecture-notes-1/
[vimwiki]: https://github.com/vimwiki/vimwiki

Emacs [org-mode][org-mode]. Being over 14 years old and evolving with the editor
itself I soon found it to be the only acceptable choice for my note-taking system.
The greatest advantage of org-mode for this was its versatility. You could embed
latex fragments directly into regular text and export directly through to HTML,
PDF, and a plethora of other targets. You can interlink between files, headings or
even manual (as in `man man`) pages as you saw fit.

[org-mode]: https://orgmode.org/

{{< figure src="./bibtex-completion.png" caption="A look at how I view my BibTex database." class="full-width-when-small clamp-width" >}}

Using org-mode also introduced me to the standards for writing scientific papers,
which made organising my sources and notes even easier. I started including lecture
PDFs and other shared documents in my [BibTex][bibtex] database. For those who
haven't encountered it before BibTex is a standard for maintaining plain-text
bibliography's that's most commonly used with latex but can also be used with
org-mode. For example here's a BibTex entry pointing to a book by Roger Pressman and
Bruce Maxim.

```bibtex
@Book{14roger-software-engineering,
  author       = {Roger S. Pressman, Bruce Maxim},
  title        = "Software Engineering: A Practitioner's Approach, 8th ed.",
  publisher    = "McGraw-Hill,",
  year         = 2014,
  desc         = "Recommended reading for COM2008 (ch. 2-6)"
}
```

I created similar entries for every lecture PowerPoint or extra material shared with
me for a university course. You can partially automate this by using
[org-capture][org-capture] for populating BibTex entries or if you're referencing a
published work you could use its unique DOI number to automatically generate a BibTex
entry for it (courtesy of the [org-ref][org-ref] package).
When I want to open a BibTex entries PDF I run `M-x consult-bibtex` (bound
to `SPC o b` in my configuration) to open the UI shown in the image above,
use [embark-act][embark] to open the PDF (bound to `C-RET o`) instead of running the
default action. In my case the default action when you select a BibTex entry is to
insert a clickable link to a specific slide in that entries PDF.

[org-capture]: https://github.com/mohkale/emacs/blob/9cd559d/init.org#org-capture
[org-ref]: https://github.com/jkitchin/org-ref
[embark]: https://github.com/oantolin/embark/blob/master/embark.el
[consult-bibtex]: https://github.com/mohkale/consult-bibtex
[bibtex]: http://www.bibtex.org/

## org-roam For the Win

At the start I was just simply creating org-mode files in a notes directory, one for
each module.

However eventually I started wanting higher level control over my notes. This involved
having headings for specific topics or sections, instead of just lectures, and being
able to tag different notes to make filtering between them easier. It was at this
point I was introduced to the [Zettelkasten][zet] note taking system by one [Jethro
Kuan][jethro]. The idea of having small, well designed, notes all linking to each other
to provide structure was novel to me. The ability to branch from one note to the
next, or thereafter made reinforcing specific topics and learning the relations
between them so much simpler. Not only did Jethro introduce me to this amazing note
taking system but he also pioneered the approach for incorporating it into org-mode
through [org-roam][org-roam].

[zet]: https://blog.jethro.dev/posts/zettelkasten_with_org/
[jethro]: https://github.com/jethrokuan
[org-roam]: https://github.com/org-roam/org-roam

{{< asciinema key="./org-roam-1.cast" preload="true" class="full-main-width-when-small" >}}

Now org-roam recently went through a major version change and with that there have
been some deprecation's. One thing you may notice in the image above is that some of
the back links don't have any titles (such as quotient remainder theorem having one
but others missing them). You may also notice the headings and links in the org-roam
buffer aren't clickable. Part of that is the fault of me using evil with org-roam and
others is simply bugs in org-roam itself. But that should be fixed quite soon and
personally I don't use the org-roam buffer much so I'm not as bothered by it.

{{< figure src="./org-roam-ui.png" caption="A look at my brain in its entirety." class="clamp-width full-main-width-when-small" >}}

If I don't use the org-roam buffer how do I navigate between notes you ask?
With [org-roam-ui][orui].
This is a recently new and improved web based interface for org-roam that lets you
see all your org-roam notes and the connections between them from a single browser
tab. You can hover over a node and org-roam-ui will highlight that node and all its
neighbours. You can also click on a node and org-roam-ui will hide all the other
nodes that aren't directly connected to the selected node allowing you to focus on a
specific topic or related set of topics. If you have EmacsClient setup you can open
nodes directly in Emacs through org-roam-ui by just selecting a node and with `M-x
org-roam-ui-follow-mode` whenever you open a new node in your emacs instance
org-roam-ui will automatically narrow to it and its neighbours.

[orui]: https://github.com/org-roam/org-roam-ui

{.img-gallery .no-style}
| {{< figure src="org-roam-ui-focused.png" >}} | {{< figure src="org-roam-ui-narrowed.png" >}}         |
|----------------------------------------------|-------------------------------------------------------|
| Highlighting the local node network.         | Narrowing to just a single node (and its neighbours). |

## My Brain Dump

To finish this post let me direct you once again to my [brain-dump][brain].

Taking inspiration from a few other sources, and heavy advantage of the excellent
[ox-hugo][ox-hugo] package, I export all of my org-roam notes to markdown and
render them onto this blog. This process is automated through my build-pipeline and
since my notes are maintained in a separate repository, my brain-dump is rebuilt at
least once a day, bringing in any new notes are changes simultaneously.
I'll document the actual process for setting this up on a Gitlab pages site in a
later post but for now I advise anyone whose interested to take a look.
Goodbye and thanks for reading ＼(＾O＾)／.

[ox-hugo]: https://github.com/kaushalmodi/ox-hugo
