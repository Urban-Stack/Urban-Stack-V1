#!/usr/bin/env bash

: "${CONTEXT=udp-local}"
: "${NAMESPACE:=udh}"
: "${STAGE:=local}"

if [[ "$STAGE" == feature ]]
then
  BUCKET_ADMIN_SECRET="rook-ceph-object-user-ns-$NAMESPACE-$STAGE-udh-platform-bucket-admin"
else
  BUCKET_ADMIN_SECRET="rook-ceph-object-user-bucket-$STAGE-udh-platform-bucket-admin"
fi

cat <<.
CONTEXT=$CONTEXT
NAMESPACE=$NAMESPACE
STAGE=$STAGE
KEYCLOAK_ADMIN_PASSWORD=$(kubectl ${CONTEXT+--context "$CONTEXT"} get secret -n "$NAMESPACE" "$STAGE"-udh-platform-sso-keycloak -o jsonpath='{.data.admin-password}' | base64 -d)
DATA_HUB_ADMIN_PASSWORD=$(helm ${CONTEXT+--kube-context "$CONTEXT"} get values -n "$NAMESPACE" "$STAGE" -o json | jq -r '.keycloak.testUsers."data-hub-admin".password')
AUTOPROVISIONING_CLIENT_SECRET=$(kubectl ${CONTEXT+--context "$CONTEXT"} get secret -n "$NAMESPACE" "$STAGE"-udh-platform-auto-provisioning-client-secret -o jsonpath='{.data.auto-provisioning-client-secret}' | base64 -d)
CLICKHOUSE_ADMIN_PASSWORD=$(kubectl ${CONTEXT+--context "$CONTEXT"} get secret -n "$NAMESPACE" "$STAGE"-udh-platform-clickhouse-users -o jsonpath='{.data.pwdAdmin}' | base64 -d)
TESTMQTT_PASSWORD=$(kubectl ${CONTEXT+--context "$CONTEXT"} get secret -n "$NAMESPACE" "$STAGE"-udh-platform-testmqtt-secret -o jsonpath='{.data.PASSWORD}' | base64 -d)
BUCKET_ADMIN_AK=$(kubectl ${CONTEXT+--context "$CONTEXT"} get secret -n "$NAMESPACE" "$BUCKET_ADMIN_SECRET" -o jsonpath='{.data.AccessKey}' | base64 -d)
BUCKET_ADMIN_SK=$(kubectl ${CONTEXT+--context "$CONTEXT"} get secret -n "$NAMESPACE" "$BUCKET_ADMIN_SECRET" -o jsonpath='{.data.SecretKey}' | base64 -d)
TARGET_URL_SUFFIX=.$(helm ${CONTEXT+--kube-context "$CONTEXT"} get values -n "$NAMESPACE" "$STAGE" -o json | jq -r '.global.baseDomain')
MAILHOG_PASSWORD=$(helm ${CONTEXT+--kube-context "$CONTEXT"} get values -n "$NAMESPACE" "$STAGE" -o json | jq -r '.keycloak.smtp.password // "adminpassword"')
SUPERSET_PASSWORD=$(helm ${CONTEXT+--kube-context "$CONTEXT"} get values --all -n "$NAMESPACE" "$STAGE" -o json | jq -r '.superset.adminUser.password')
.

case "$STAGE" in
  local | feature)
    echo NODE_EXTRA_CA_CERTS="$(readlink -f "$(dirname "$BASH_SOURCE")/../docs/$STAGE-ca.crt")"
    ;;
esac
