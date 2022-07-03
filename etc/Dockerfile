# syntax=docker/dockerfile:1
#
# Deploy with:
# - docker build -t registry.gitlab.com/mohkale/mohkale.gitlab.io .
# - docker push registry.gitlab.com/mohkale/mohkale.gitlab.io

FROM archlinux

# Setup locale and build environment
RUN echo "en_US UTF-8" > /etc/locale.gen        \
 && locale-gen en_US.UTF-8                      \
 && export LANG=en_US.UTF-8                     \
 && export LANGUAGE=en_US:en                    \
 && export LC_ALL=en_US.UTF-8

# Install base system dependencies.
RUN pacman -Sy                                                                        \
 && pacman -S --noconfirm                                                             \
      autoconf                                                                        \
      automake                                                                        \
      emacs                                                                           \
      gcc                                                                             \
      git                                                                             \
      icu                                                                             \
      inotify-tools                                                                   \
      jq                                                                              \
      libffi                                                                          \
      libtool                                                                         \
      make                                                                            \
      nodejs                                                                          \
      pandoc                                                                          \
      python-watchdog                                                                 \
      ruby                                                                            \
      wget                                                                            \
      xz                                                                              \
      yarn                                                                            \
      zlib                                                                            \
 && pacman -U --noconfirm                                                             \
      https://archive.archlinux.org/packages/h/hugo/hugo-0.85.0-1-x86_64.pkg.tar.zst  \
 && pacman -Scc

# Post setup global configuration.
RUN git config --global --add safe.directory /blog

# Setup Ruby dependencies.
#
# I use ruby for repo management scripts and end-result testing with html-proofer.
ENV PATH="/root/.local/share/gem/ruby/3.0.0/bin:${PATH}"
COPY Gemfile Gemfile.lock /tmp/gem-install/
RUN cd /tmp/gem-install                                     \
 && gem install bundler                                     \
 && bundle config --global build.ffi --enable-system-libffi \
 && bundle install                                          \
 && rm -rf /tmp/gem-install

# Setup Node dependencies.
#
# I use node for web development :wink:. It's how I write JavaScript
# with TypeScript and preprocess various assets before being passed
# to Hugo.
# ENV NODE_PATH="/var/blog/node_modules:${NODE_PATH}"
# RUN echo '--modules-folder /var/blog/node_modules' > ~/.yarnrc  \
#  && yarn install --network-timeout 10000000

# Setup emacs
RUN mkdir -p ~/.emacs.d/                        \
 && touch ~/.emacs.d/early-init.el

WORKDIR /blog
