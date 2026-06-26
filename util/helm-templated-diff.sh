#!/usr/bin/env bash

# templates the Helm chart and prints a diff between the current working directory and the version at the given ref (default HEAD)

set -eu -o pipefail

cd "$(dirname "$0")"/..

tmpdir="`mktemp -d`"
ref=${1-HEAD}

template () {
  helm template foo charts/* -f charts/*/values-local.yaml |
  sed -E 's/.*(secret|fileContents|rgw_sts_key).*|^ *value: ".{32}"$|: "[a-zA-Z0-9+/]{43}="$/nodiff/i'
}

git worktree add --detach "$tmpdir" "$ref"
cp -r charts/*/charts "$tmpdir"/charts/*/

cd "$tmpdir"
template > "$tmpdir/.old"
cd -
template > "$tmpdir/.new"

echo =DIFF=
${DIFFTOOL-diff -c3} "$tmpdir"/.{old,new} || true
echo =DIFF=

rm -r "$tmpdir"
git worktree remove "$tmpdir"
