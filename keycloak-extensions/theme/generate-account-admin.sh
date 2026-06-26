#!/usr/bin/env bash

set -eu -o pipefail

chart_version=$1
echo "calling https://raw.githubusercontent.com/bitnami/charts/refs/tags/keycloak/$chart_version/bitnami/keycloak/values.yaml"
kc_version=$(curl https://raw.githubusercontent.com/bitnami/charts/refs/tags/keycloak/$chart_version/bitnami/keycloak/values.yaml |
  grep ^image: -A9999 |
  grep -oP '(?<=^  tag: )([^-]+)')

generate () {
  local parent=$1
  local kind=$2

  dir=src/main/resources/theme/data-hub/$kind
  mkdir $dir
  echo "calling https://raw.githubusercontent.com/keycloak/keycloak/refs/tags/$kc_version/js/apps/$kind-ui/maven-resources/theme/$parent/$kind/index.ftl"
  curl -o $dir/index.ftl https://raw.githubusercontent.com/keycloak/keycloak/refs/tags/$kc_version/js/apps/$kind-ui/maven-resources/theme/$parent/$kind/index.ftl
  git -C $dir apply $PWD/console-legal.patch
  echo parent=$parent > $dir/theme.properties
}

generate keycloak.v3 account
generate keycloak.v2 admin
