#!/usr/bin/env bash

set -eu -o pipefail

tmp=`mktemp -d --suffix=-screenshots`
echo "$tmp"

wget --directory-prefix="$tmp" \
     --recursive \
     --level=5 \
     --no-verbose \
     --no-parent \
     --no-host-directories \
     --accept=html,webp \
     --execute=robots=off \
     https://docs.staging.udp.teuto.dev/

cp -rv "$tmp"/screenshots "$(readlink -f "$(dirname "$BASH_SOURCE")")/user/docs/"

rm -r -- "$tmp"
