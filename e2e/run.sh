#!/usr/bin/env bash

set -a
eval "$("$(dirname "$BASH_SOURCE")/env.sh")"
set +a

exec npx playwright test --reporter=html --grep-invert=@delete-tenants "$@"
