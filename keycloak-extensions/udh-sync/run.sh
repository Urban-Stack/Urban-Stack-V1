#!/usr/bin/env bash

set -eu -o pipefail

cd "$(dirname "$BASH_SOURCE")"

set -a
eval "$(../../e2e/env.sh)"
set +a

exec bb run resource-integration-tests
