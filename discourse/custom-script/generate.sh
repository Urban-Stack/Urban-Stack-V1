#!/usr/bin/env bash

echo "Generate shared files"
mkdir -p "generated"

rm -r ./generated/**

printf "Copying shared files...\n\n"
cat - ../../frontend/govhub/app/_lib/discourse/iframe-communication/message.ts \
  > ./generated/message.ts <<<$'/* Generated - Do not edit manually */\n'