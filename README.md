# My Blog

Happily made with [hugo][hugo] :heart:

[hugo]: https://gohugo.io/

Official repository can be found on [gitlab](https://gitlab.com/mohkale/mohkale.gitlab.io).

## Setup Instructions
```
git submodule update --init --recursive
./dev/setup
bundle exec thor install:all
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
| arch                 | hugo archetypes       |
| thor                 | thor scripts          |
| etc/config           | hugo config directory |
| src/assets/images/fa | fontawesome SVGs      |
| etc/gitlab.yml       | gitlab-ci/cd config   |

## Warnings
This repository only builds with hugo `0.85.0`.
Newer versions ship with simpler markdown renderers that are either buggy or lack
support for some of the features this blog depends on.
