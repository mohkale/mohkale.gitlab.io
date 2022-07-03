# My Blog

Happily made with [hugo][hugo] :heart:

[hugo]: https://gohugo.io/

Official repository can be found on [gitlab](https://gitlab.com/mohkale/mohkale.gitlab.io).

## Setup Instructions

```bash
git clone --recurse-submodules git@gitlab.com:mohkale/mohkale.gitlab.io.git
docker-compose build
docker-compose run --rm server bundle exec thor install:all
docker-compose run --rm server
```

## Description

- Generated using [hugo][hugo].
- 99.9999% [typescript][tsc] (some configs are in plain JS).
- [webpack][webpack] for compilation, minification & preprocessing.
- Task automation using [thor][thor].
- Tested using [html-proofer][HTMLProofer].

[tsc]: https://www.typescriptlang.org/
[webpack]: https://webpack.js.org/
[thor]: https://github.com/erikhuda/thor
[HTMLProofer]: https://github.com/gjtorikian/html-proofer

### Directory Structure

I try to keep the root of my project directories as clean as possible.
Here's a summary of some useful files/dirs.

| path                 | description           |
|----------------------|-----------------------|
| arch                 | Hugo Archetypes       |
| bin/thor             | Thor Scripts          |
| etc/config           | Hugo Config Directory |
| src/assets/images/fa | Fontawesome SVGs      |
| etc/gitlab.yml       | Gitlab CI/CD Config   |

## Warnings

This repository only builds with hugo `0.85.0`.
Newer versions ship with simpler markdown renderers that are either buggy or lack
support for some of the features this blog depends on.

## Troubleshooting

### Error: module "org/brain-hugo" not found

This error means you do not have an org-roam brain directory setup like my own.
Personally I maintain this directory in a separate git repository and clone it
into `vendor/org` in my CI/CD build. It's a private repo so sadly you can't
copy it easily into your own blog :sad:.

The format of my org-notes repository contains a single Makefile and a subdirectory
called `brain-hugo` which functions as a Hugo site itself and has my org-notes
exported into it through ox-hugo using the Makefile. You should create a similair
system for your own notes repository.
Alternatively if you're not interested in the brain aspect of my blog you can
simply do create a dummy brain using the following bash snippet or patch out the
brain functionality altogether.

```bash
mkdir -p vendor/org/brain-hugo/content/brain/ &&                    \
  echo -e '---\n---\nhello' > vendor/org/brain-hugo/content/brain/
```
