ARG REGISTRY_MIRROR=""
ARG REGISTRY_MIRROR_LIB=""

ARG SUPERSET_REF=5.0.0rc2
FROM ${REGISTRY_MIRROR_LIB}node:24-alpine@sha256:8a32c8cf649a49915a66e81e7a609223c708d0adabf288ee3f4077d765542f85 AS build
ARG SUPERSET_REF

RUN apk add git zstd bash && \
    git clone --depth 1 https://github.com/apache/superset -b "$SUPERSET_REF" /superset-rebuild

COPY patches /superset-patches
RUN git -C /superset-rebuild apply /superset-patches/*

RUN cd /superset-rebuild/superset-frontend && \
    npm ci && \
    SCARF_ANALYTICS=false npm run build && \
    npm run build-translation && \
    rm -rf node_modules && \
    npm cache clean --force && \
    rm /superset-rebuild/superset/translations/*/LC_MESSAGES/*.po /superset-rebuild/superset/translations/messages.pot

FROM ${REGISTRY_MIRROR}apache/superset:$SUPERSET_REF

USER root
RUN sed -i 's/cryptography>=42\.0\.4, <44\.0\.0/cryptography>=42.0.4, <46.0.0/' pyproject.toml
# renovate: datasource=pypi depName=Authlib
ENV AUTHLIB_VERSION=1.9.0
RUN apt update && apt upgrade -y && \
    apt install -y build-essential git && \
    uv pip install Authlib==$AUTHLIB_VERSION .[cors,clickhouse,postgres,thumbnails,playwright] && \
    playwright install-deps && \
    playwright install chromium && \
    apt remove -y gstreamer1.0-plugins-good libsoup-3.0-0 libsoup-3.0-common libxml2 && \
    apt autoremove -y && \
    apt-get clean

# fix CVE-2025-43859
# renovate: datasource=pypi depName=h11
ENV H11_VERSION=0.16.0
# fix CVE-2026-102268
# renovate: datasource=pypi depName=PyJWT
ENV PYJWT_VERSION=2.15.1
# fix GHSA-6q48-6c7w-9gw2 (compromised emSign intermediate CA keys)
# renovate: datasource=pypi depName=certifi
ENV CERTIFI_VERSION=2026.10.19
# renovate: datasource=pypi depName=brotli
ENV BROTLI_VERSION=1.2.1
RUN uv pip install h11==$H11_VERSION PyJWT==$PYJWT_VERSION certifi==$CERTIFI_VERSION brotli==$BROTLI_VERSION

COPY patches /superset-patches
RUN git -C /app apply --exclude="superset/translations/*" --include="superset/*" /superset-patches/*

RUN rm -r superset/static/assets superset/translations
COPY --chown=superset:superset --from=build /superset-rebuild/superset/static/assets superset/static/assets
COPY --chown=superset:superset --from=build /superset-rebuild/superset/translations superset/translations

COPY import /import

USER superset
