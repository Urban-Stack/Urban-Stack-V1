ARG REGISTRY_MIRROR_LIB=""
ARG REGISTRY_MIRROR=""

# DOWNLOAD GOOGLE FONTS
FROM ${REGISTRY_MIRROR}alpine/git:v2.52.0 AS google-fonts

ARG GOOGLE_FONT_REF=c52c80facfb2e68b2d34b011321a62edcd8207ff
WORKDIR /opt/google-fonts

RUN git clone --depth 1 --filter=blob:none -n https://github.com/google/fonts.git . && \
    git sparse-checkout set ofl/poppins && \
    git fetch --depth 1 origin "$GOOGLE_FONT_REF" && \
    git checkout "$GOOGLE_FONT_REF"
RUN mv ofl/poppins /opt/poppins

# BUILD CUSTOM SCRIPT
FROM ${REGISTRY_MIRROR_LIB}node:24-slim AS custom-plugin-build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# renovate: datasource=npm depName=pnpm
ENV PNPM_VERSION=10.33.4
RUN npm install --global pnpm@"$PNPM_VERSION"
COPY custom-script/ /opt/custom-script/
WORKDIR /opt/custom-script

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

# FINAL IMAGE
FROM ghcr.io/ol-teuto/discourse:2026.5.0-debian-12-r12@sha256:27865135b52995ee4ae41c81bfe89de4a313f4b290650d3d75f62b1af15f5f99

# remove unused dependency with CVE
RUN apt remove -y libsqlite3-0 && apt update && apt upgrade -y

# https://github.com/discourse/message_bus/blob/40dedff6bda3d686a1ab71f5a9bc52ec29b71799/README.md#passenger
RUN echo "location /message-bus { passenger_app_group_name foo_websocket; passenger_force_max_concurrent_requests_per_process 0; }" \
    >> /opt/bitnami/discourse/vendor/bundle/ruby/*/gems/passenger-*/resources/templates/standalone/server.erb

# Copy custom theme
COPY theme /opt/ugh-theme
COPY --from=custom-plugin-build /opt/custom-script/dist/ugh-script.js \
  /opt/ugh-theme/javascripts/discourse/initializers/ugh-script.js

# Copy additional images & assets to be available to the frontend
COPY images/* /opt/bitnami/discourse/public/images/
COPY --from=google-fonts /opt/poppins/* /opt/bitnami/discourse/public/fonts/

# there is a bug in discourse, where list settings set via the config file don't work
# PR: https://github.com/discourse/discourse/pull/31368
COPY patches/ /patches/

RUN git -C /opt/bitnami/discourse apply /patches/*

# Custom theme
COPY install_theme.rake /opt/bitnami/discourse/lib/tasks/install_theme.rake
