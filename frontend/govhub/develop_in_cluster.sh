#!/usr/bin/env bash

set -eu -o pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

DEPLOYMENT="local-udh-platform-govhub"

telepresence connect -n udh
telepresence intercept $DEPLOYMENT --port 3000:80
