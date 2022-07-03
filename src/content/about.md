---
title: About
menu:
  nav:
    weight: 20

kind: page
layout: about

# A section shown just before the main content. This just consists of a title, an icon
# and some associated values. Populate it with whatever you feel is relevent. The content
# of this file will appear after this section.
about:
  - title: Birthday
    icon: [solid, birthday-cake]
    text: December 08, 1999

  - title: Belongs
    icon: [solid, school]
    text: "[University of Sheffield](https://www.sheffield.ac.uk/)"

  - title: Department
    icon: [solid, graduation-cap]
    text: "[Department of Computer Science](https://www.sheffield.ac.uk/dcs)"

interests:
  - title: Favourite Games
    icon: [solid, gamepad]
    text: |-
      {.inline-list .nt}
      - [Cave Story](https://www.cavestory.org/game-info/about-cave-story.php)
      - [Deus Ex: HR](https://store.steampowered.com/app/238010/Deus_Ex_Human_Revolution__Directors_Cut/)

  - title: Favourite Movies
    icon: [solid, film]
    text: |-
      {.inline-list .nt}
      - [The Great Gatsby](https://www.imdb.com/title/tt1343092/)

  - title: Favourite TV Shows
    icon: [solid, tv]
    text: |-
      {.inline-list .nt}
      - [Warrior](https://www.imdb.com/title/tt5743796/)
      - [The Last Kingdom](https://www.imdb.com/title/tt4179452/)
      - [H&CF](https://www.imdb.com/title/tt2543312/)

  - title: Favourite Anime
    icon: [solid, crosshairs]
    text: "**Impossible to Rank ヽ(´□｀。)ﾉ**"

# skills are represented as an array of properties associated with a skill.
# Available fields include:
#
# # How to distinguish this skill from other skills.
# title: "foo"
#
# # An optional icon, shown alongside the skill (before the title). Defaults
# # to a gear/cog.
# icon:
#   - family
#   - icon
#
# # A list of lists of strings. Each nested list structure adds depth to the
# # associated tags, which are thus highlighted differently. As it stands,
# # only three levels of tags are supported.
# tags:
#   - A single tag
#   - - A collection of tags
#     - Here's another

skills:
  - title: C#
    icon: [devicon, csharp]
    tags:
      - Visual Studio
      - - WinForms
        - MonoGame

  - title: Python
    icon: [devicon, python]
    tags:
      - PyCharm
      - - pip
        - venv
      - - flask
        - django
        - scrapy
        - numpy

  - title: Java
    icon: [devicon, java]
    tags:
      - IDEA
      - - OpenJDK
        - kotlin
      - - Gradle
        - Swing
        - JavaFX

  - title: Linux
    icon: [devicon, linux]
    tags:
      -
      - - Arch
        - Ubuntu
      - - bash

  - title: Node/JS
    icon: [devicon, javascript]
    tags:
      - VSCode
      - TypeScript
      - - Redux
        - Vue
        - React
        - Express.js

  - title: SQL
    icon: [devicon, mysql]
    tags:
      -
      - - SQLite
        - MySQL/MariDB

  - title: HTML
    icon: [devicon, html]
    tags:
      -
      - - HTML5
        - CSS
        - SCSS
      - - Go Templates
        - Liquid

  - title: Ruby
    icon: [devicon, ruby]
    tags:
      - rubymine
      - mruby
      - - Rake
        - Sinatra
        - Thor
        - Jekyll

  - title: Go
    icon: [devicon, go]
    tags:
      -
      - - go(lang)
        - Hugo

# A timeline for my life. The format is similair to skills except its
# specialised for structuring date dependent data. Supported fields are.
#
# # The text content for this entry. This'll be passed through a markdown
# # processor so you can use markdown supported syntax.
# text: foo bar
#
# # Icon associated with this entry. Unlike skills a default icon won't be
# # assigned, when not specified no icon will be included.
# icon: ["family", "icon"]
#
# # The date associated with this element in the timeline. Every entry should
# # specify a date.
# date: 2006-01-02
#
# # Any special color formatting for this entry. These depend on the color
# # classes defined in about.scss.
# color: red
#
# # An array of links to websites/pages associated with this timeline entry.
# links:
#   - title: Event Details
#     link: https://site.com/link/to/event-details

timeline:
  - text: Hired as a Software Engineer at Bloomberg LP
    icon: [solid, star]
    date: 2021-11-01
    color: red
  - text: Graduated from the University of Sheffield
    icon: [solid, graduation-cap]
    date: 2021-07-16
    color: red
  - text: I'm Born, **Hello World**!
    icon: [solid, birthday-cake]
    date: 1999-12-08
    color: red
---
