# syntax=docker/dockerfile:1
#
# Deploy with:
# - docker build -t registry.gitlab.com/mohkale/mohkale.gitlab.io .
# - docker push registry.gitlab.com/mohkale/mohkale.gitlab.io
FROM archlinux
# Setup locale and build environmentG
RUN echo "en_US UTF-8" > /etc/locale.gen; \
    locale-gen en_US.UTF-8; \
    export LANG=en_US.UTF-8; \
    export LANGUAGE=en_US:en; \
    export LC_ALL=en_US.UTF-8;
# Install base dependencies.
## WARN: Hard-coded ruby version.
RUN pacman -Sy; \
    pacman -S --noconfirm ruby libffi zlib xz icu jq wget git automake autoconf libtool gcc make npm nodejs emacs; \
    pacman -U --noconfirm https://archive.archlinux.org/packages/h/hugo/hugo-0.85.0-1-x86_64.pkg.tar.zst
ENV PATH="/root/.local/share/gem/ruby/3.0.0/bin:${PATH}"
RUN gem install bundler;
