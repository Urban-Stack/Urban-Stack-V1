#!/usr/bin/env bash

set -eu -o pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

DEPLOYMENT="local-udh-platform-citizenhub"

telepresence connect -n udh
telepresence intercept $DEPLOYMENT --port 3001:80
