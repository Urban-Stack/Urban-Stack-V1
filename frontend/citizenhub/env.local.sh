#!/usr/bin/env bash

export NODE_TLS_REJECT_UNAUTHORIZED=0

AUTH_SECRET=$(openssl rand -base64 33)
export AUTH_SECRET
export AUTH_URL=https://citizenhub.data-hub.local
export AUTH_DEBUG=true

export KEYCLOAK_URI=https://login.data-hub.local
export AUTH_KEYCLOAK_ID=citizen-hub
export AUTH_KEYCLOAK_ISSUER=${KEYCLOAK_URI}/realms/citizenhub
AUTH_KEYCLOAK_SECRET=$(kubectl -n udh get secret local-udh-platform-citizen-hub-client-secret -o jsonpath='{.data.citizen-hub-client-secret}' | base64 -d)
export AUTH_KEYCLOAK_SECRET

export SUPERSET_URI=https://superset.data-hub.local
export GRAPHQL_URI=https://login.data-hub.local/realms/udh/data-hub/graphql
export CITYTOOLS_URI=https://citytools.data-hub.local
export CKAN_URI=https://ckan.data-hub.local

export TARGET_URL_SUFFIX=.data-hub.local
