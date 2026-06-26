#!/usr/bin/env bash

cd ./lib/udp-ui || exit
pnpm i --frozen-lockfile
pnpm run build