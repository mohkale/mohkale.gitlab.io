---
title: Cheatsheet
date: 2020-04-26
categories: meta
# draft: true

# layout lookup rules
kind: page
layout: single

thumbnail:
  path: 294738.jpg
  caption: cheatsheet, every good site should have one
  height: 500
  position: top
  resize: 1000x1000
  source:
    link: https://yande.re/pool/show/3534
    title: kantoku

meta:
  comments: true
  post: true
  latex: true
  anchor_links: true
  title: {"display": "Style Guide Cheatsheet"}
---

This page demonstrates some of the different ways to control the rendering of
different markdown elements on this blog. This page makes heavy use of
[block level attributes][mmark-bla] as supported by mmark, such as:

[mmark-bla]: https://mmark.miek.nl/post/syntax/#block-level-attributes

```markdown
{.foo .bar} hello world
```

this results in a paragraph with the text-content `hello-world` and classes `foo` and
`bar`.

## Basics
| class       | description                             |
|-------------|-----------------------------------------|
| left        | float to left                           |
| right       | float to right                          |
| clear-left  | clear floating elements on the left     |
| clear-right | clear floating elements on the right    |
| stack-left  | float-left and add some indent          |
| stack-right | float-right and add some indent         |
| center      | center-align an image or paragraph tag  |
| inline      | display element inline to it's siblings |

## Colors
There are classes defined for each predefined color and derivatives of those classes
which're activated when marked elements are hovered. For a list of available colors,
see *colors.scss*.

For example, using the color `red` we can define:

> <p>hello <span class="red">sailor</span></p>
> <p>hello <span class="hl-red">sailor</span></p>

using the following HTML.

```html
<p>hello <span class="red">sailor</span></p>
<p>hello <span class="hl-red">sailor</span></p>
```

The same general form is used for other supported colors.

## Blockquotes
blockquotes are supported through both the builtin markdown syntax (lines prefixed
with `> `) and a shortcode which supports citing a source for the blockquote as well.

The shortcode takes **keyword** arguments for `src` and `cite`. The src field is used
in the src attribute of the tag, whereas the cite field is appended to tail of the
tag and formatted in a way to make it stand out. For example the following will
result in:

```markdown
{{</* quote cite="Jon Von Neuman" */>}}
  One can even conjecture that *Lisp owes* its survival specifically to the
  fact that its programs are lists, which everyone, including me, has
  regarded as a disadvantage.
{{</* /quote */>}}
```

{{< quote cite="Jon Von Neuman" >}}
  One can even conjecture that *Lisp owes* its survival specifically to the
  fact that its programs are lists, which everyone, including me, has
  regarded as a disadvantage.
{{< /quote >}}

## Source Code
See the [docs][hugo-highlight] on source code highlighting.

[hugo-highlight]: https://gohugo.io/content-management/syntax-highlighting/

{{< highlight python "hl_lines=2-3" >}}
def fib(n):
  if n <= 1:
    return n
  return n + fib(n-1)
{{< / highlight >}}

## Lists
Lists are written in the classic markdown style.

- Apples
- Oranges
- Grapes

The inline list class can be used to collapse all list elements together.

```markdown
{.inline-list}
- apples
- oranges
- grapes
```

{.inline-list}
- apples
- oranges
- grapes

## Tables
By default, this blog renders tables as full-width containers. An
example of it can be found at [basics]({{< relref "#basics" >}}).

The following classes alter the styling of html tables.

| Class      | Description                                           |
|------------|-------------------------------------------------------|
| auto-width | let the table grow to an appropriate width.           |
| no-style   | don't apply foreground, background or border styling. |

## Images
### Galleries
You can turn a simple table into an equal split image gallery using the `.img-gallery`
class.

```markdown
{.img-gallery .no-style}
| {{</* figure src="5210.webp" */>}} | {{</* figure src="5213.webp" */>}} |
|------------------------------------|------------------------------------|
| caption: *sleepy* Izumi            | caption: *excited* Izumi           |
```

{{< notify "warn" "mmark requires a table head seperator, even when the table uses default alignment." >}}

{.img-gallery .no-style}
| {{< figure src="5210.webp" >}} | {{< figure src="5213.webp" alt="izumi is excited" >}} |
|--------------------------------|-------------------------------------------------------|
| caption: *sleepy* Izumi        | caption: *excited* Izumi                              |

## Shortcodes
### Fontawesome
You can include fontawesome icons using the **fontawesome** shortcode. This
shortcode expands the path to where fa icons are stored, reads the desired SVGs and
includes (a link to) them at the current position of the document.

SVGs are defined right at the end of the document (after the footer), so icons won't
be defined more than once (if included in the document more than once) and they won't
be loaded until after the page has.

{{< fontawesome "s" "yin-yang" "left width-20" >}}

You can specify the `path` and `type` fields as keyword arguments but, more often
than not, it'll be easier to simply pass them as ordinal arguments. You can also
abbreviate the type to a single character (in which case the appropriate type will be
calculated at runtime).

```markdown
{{</* fontawesome "s" "yin-yang" */>}}
```

See [here](./fontawesome/index.html) for a preview of all supported fontawesome icons.

#### Editing SVGs
When editing SVGs (by hand, from a file), take care ~~for reasons beyond my understanding~~ that this blog
assumes the icon has no trailing linefeed or linebreak character. When in doubt, try running through `xxd`.

```bash
xxd /path/to/file
```

and observe whether the last byte after the svg is `0a` or `0d0a`. You can remove these using the truncate
command:

```bash
truncate -s -1 /path/to/file
```

### Notifications
The `notify` shortcode can be used to make highlighting important information easier. It takes two
arguments the kind/importance of information being displayed and the message. for eg.

```markdown
{{</* notify "" "megumin's gonna blow" */>}}
```

{{< notify "" "megumin's gonna blow" >}}

Similairly special formatting has been setup for the following kinds:

- debug (note)
- info
- warning
- error
- success

{{< notify "debug" "megumin's charging up" >}}

{{< notify "info" "megumins explosion charge is over 9000!" >}}

{{< notify "warn" "megumins explosion is imminent" >}}

{{< notify "error" "kazuma was caught in the crossfire" >}}

{{< notify "success" "the **glorious** explosion has painted the sky orange" >}}

### Ascii
<div class="ascii-block">
    {{< ascii "figlets/welcome-to" >}}

    {{< ascii "figlets/hugo" "blue" >}}
</div>

{{< ascii "question-mark" "left green" >}}

You can include ascii gifs on the page using the `{{</* ascii "question-mark" */>}}`
shortcode. The first argument to the shortcode is the path to the desired art file,
relative to the root ascii art directory. The second argument is a class which
if given, will be attached to the gif.

You can also wrap ascii gifs in a div with the class `ascii-block` and it'll be
displayed flexibly; like above.

### Gists
Hugo comes with a [builtin](https://gohugo.io/content-management/shortcodes/#gist)
shortcode to reference github gists. It takes the form:

```markdown
{{</* gist USER HASH [FILE] */>}}
```

{{< gist mohkale c02f872d3cfd04d944deaf381aa62911 >}}

### Asciinema
I've created a shortcode to support [asciinema](https://asciinema.org/)
recordings. These are just recordings of text sessions (most probably
from a terminal) that can be played back on your site. For a list of
supported options, see `src/layouts/shortcodes/asciinema.html`.

```markdown
{{</* asciinema key="./neofetch.cast" */>}}
```

{{< asciinema key="./neofetch.cast" >}}

{{< notify "note" "if not supplying any other options, you can pass `key`, `cols` & `rows` as positional arguments." >}}

At the moment globally accesible recordings go into `src/assets/casts`.
You can define local recordings using page [resources]({{< ref "#resources" >}}).
In the shortcode, local resources will be used when the key in the `asciinema`
shortcode is prefixed with `./`, otherwise global resources will be used,

{{< notify "warn" "Try to avoid making exceedingly wide recordings." >}}

Recordings should be
playable on the smallest screen size supported, which at the moment is
443px. They can be as high as desired. If your recordings are too wide
asciinema will clip off the right hand side, showing only the visible
portion.

## Frontmatter
### Styles
stylesheets by default are placed in `/assets/styles/`. every page can specify an
array of styles in it's frontmatter, which override the default styles that a page
should recieve. NOTE: By override here, I mean default styles won't be loaded at all
and instead only the given stylesheets will be. For example:

```markdown
---
styles:
  - my-sheet.scss
---
```

will result in `/assets/styles/my-sheet.css` being the only stylesheet used on the
current page.

You can also set the `default_styles` field to `true` to include the default styles
alongside the new ones. In this case, the defaults will be loaded first and, any, other
styles afterwards

```markdown
---
default_styles: true
styles:
  - my-sheet.scss
---
```

### Thumbnail
Pages can define a thumbnail image. This image will be shown at the top of the page
(after the title) and may have an associated caption (and source) to indicate where
its from or what it's showing.

```yaml
thumbnail:
  path: path/to/image/resource.jpg
  caption: cheatsheet, every good site should have one
  height: 500 # maximum height of the image
  position: center # object-position property
  resize: widthxheight # resize image before showing
  source:
    link: "https://find-this-image-here.com/image"
    title: show this instead of the image link
```

### Meta
The frontmatter section of each page can contain a meta dictionary which lets you
configure rendering of the page. You can also configure these for an entire section
using Hugos [front matter cascade][fmc] feature.

[fmc]: https://gohugo.io/content-management/front-matter/#front-matter-cascade

Here are the prescribed defaults and their intended affects.

```yaml
meta:
  # include a Disqus comment thread on this page
  comments: false
  # include meta data about post, include date
  # categories, tags, next/prev post etc.
  post: false
  # whether to make headings links to themselves.
  anchor_links: true
  # latex, render latex at runtime using mathjax
  latex: true
  # configure rendering of the title element
  title:
    # when true the title is ommitted from the page
    hidden: true
    # override the title that's shown, the page title
    # is still .Title
    display: "New title"
```

For demonstration purposes, each of these have been toggled to their non-default
state on this page.

For `_index.md` section pages, you can also apply the following styles to alter
how those pages are paginated in taxonomies etc.

```yaml
meta:
  # prevents subsections/posts from having a date field
  # included in their pagination. See /notes/langs/.
  no_date: true
```

### Layouts
hugo has extensive (& frankly overly complex) [rules][hugo-layout-rules] for
which layout to use for a given page on your site. ~~It's bitten me in the back more
times than I can count :cry:.~~

[hugo-layout-rules]: https://gohugo.io/templates/lookup-order/

Each page has a [kind][hugo-kind] attribute which determines the kind of page that is
looked for in the lookup order. You can set this attribute in the frontmatter.

[hugo-kind]: https://gohugo.io/templates/section-templates/#page-kinds

Pages also have a `type` field which matches the section under which the page is
found. These are used in lookup rules to override the layouts contained in the
`_defaults` folder.

Lastly, you can specify a `layout` field, in which case a layout with the given name
(extension is optional) is searched for in the root of the layouts directory or a
subdirectory matching the pages `type`.

### Resources
resources are files that're used (locally) by a page, such as images or stylesheets.

Only `index.md` or `_index.md` pages can have page resources, see
[here](https://gohugo.io/content-management/page-resources/#page-resources-metadata)
for how to configure them.

{{< notify "warn" `**_index.md** pages don't support resources in subdirectories.
They **must** be in the same directory as itself.` >}}
