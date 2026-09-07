#!/usr/bin/env bash

set -eu -o pipefail

kc_version=$1

generate () {
  local parent=$1
  local kind=$2

  dir=src/main/resources/theme/data-hub/$kind
  mkdir $dir
  echo "calling https://raw.githubusercontent.com/keycloak/keycloak/refs/tags/$kc_version/js/apps/$kind-ui/maven-resources/theme/$parent/$kind/index.ftl"
  curl --fail -o $dir/index.ftl https://raw.githubusercontent.com/keycloak/keycloak/refs/tags/$kc_version/js/apps/$kind-ui/maven-resources/theme/$parent/$kind/index.ftl
  git -C $dir apply $PWD/console-legal.patch
  echo parent=$parent > $dir/theme.properties
}

generate keycloak.v3 account
generate keycloak.v2 admin
