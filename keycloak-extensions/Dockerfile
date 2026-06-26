ARG REGISTRY_MIRROR_LIB=""

FROM ${REGISTRY_MIRROR_LIB}maven:3.9.15-eclipse-temurin-21 AS java-build

RUN mkdir /target

# cache dependencies
WORKDIR /project
COPY theme/pom.xml /project/
RUN mvn package ; rm -r target/

COPY theme /project/
# renovate: datasource=docker depName=bitnamicharts/keycloak
ARG KEYCLOAK_CHART_VERSION=24.3.2
RUN ./generate-account-admin.sh $KEYCLOAK_CHART_VERSION && mvn package && cp target/*.jar /target

FROM ${REGISTRY_MIRROR_LIB}maven:3.9.15-eclipse-temurin-21 AS kc-frontend-build

WORKDIR /project
RUN mkdir /target

# renovate: datasource=github-tags depName=nvm-sh/nvm
ARG NVM_VERSION=v0.40.4
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh | bash

RUN git clone --depth 1 https://github.com/keycloak/keycloak.git --branch 26.0.7
WORKDIR /project/keycloak/js/apps/account-ui
RUN cp -r maven-resources/theme/keycloak.v3 maven-resources/theme/teuto-react

COPY theme/teuto-react/theme-rename.patch /theme-rename.patch
RUN git -C /project/keycloak apply /theme-rename.patch

RUN . ~/.nvm/nvm.sh && nvm install 24 && corepack enable && mvn package

# Copy static assets
COPY theme/teuto-react/assets/fonts ./src/assets/fonts
COPY theme/teuto-react/custom.css ./src/custom.css

COPY theme/teuto-react/custom.patch /custom.patch
RUN git -C /project/keycloak apply /custom.patch

COPY theme/teuto-react/add-custom-css-account-ui.patch /add-custom-css-account-ui.patch
RUN git -C /project/keycloak apply /add-custom-css-account-ui.patch

RUN . ~/.nvm/nvm.sh && mvn package && cp target/*.jar /target

FROM ${REGISTRY_MIRROR_LIB}gradle:9.5-jdk21-alpine AS kotlin-build
WORKDIR /home/gradle/src
COPY --chown=gradle:gradle udh-sync/*.kts ./
RUN gradle --write-verification-metadata sha256 help -i
COPY --chown=gradle:gradle udh-sync ./
RUN gradle test fatJar -i

FROM ${REGISTRY_MIRROR_LIB}busybox:1.37.0
COPY --from=java-build /target /providers
COPY --from=kotlin-build /home/gradle/src/build/libs/udh-sync-all.jar /providers
COPY --from=kc-frontend-build /target /providers
CMD cp /providers/* /target/