#!/usr/bin/env bash

export NODE_TLS_REJECT_UNAUTHORIZED=0

AUTH_SECRET=$(openssl rand -base64 33)
export AUTH_SECRET
export AUTH_URL=https://govhub.data-hub.local
export AUTH_DEBUG=true

export KEYCLOAK_URI=https://login.data-hub.local
export AUTH_KEYCLOAK_ID=government-hub
export AUTH_KEYCLOAK_ISSUER=${KEYCLOAK_URI}/realms/udh
AUTH_KEYCLOAK_SECRET=$(kubectl -n udh get secret local-udh-platform-government-hub-client-secret -o jsonpath='{.data.government-hub-client-secret}' | base64 -d)
export AUTH_KEYCLOAK_SECRET

export SUPERSET_URI=https://superset.data-hub.local
export DISCOURSE_URI=https://community.data-hub.local
export GRAPHQL_URI=${AUTH_KEYCLOAK_ISSUER}/data-hub/graphql
export JUPYTERHUB_URI=https://jupyterhub.data-hub.local
export CKAN_URI=https://ckan.data-hub.local
export DOCS_URI=https://docs.data-hub.local
export CITYTOOLS_URI=https://citytools.data-hub.local
export STORAGE_URI=https://storage.data-hub.local
export AIDEMO_URI=https://aidemo.urbanstack.de
export PUBQUERY_URI=https://api.data-hub.local
export HELPDESK_URI=https://govhub.data-hub.local # TODO: adjust when helpdesk api is deployed and remove dummy endpoint under ./app/api/helpdesk
export SENSOR_METADATA_URI=https://api.data-hub.local
export CITIZENHUB_URI=https://citizenhub.data-hub.local

export TARGET_URL_SUFFIX=.data-hub.local
