ARG REGISTRY_MIRROR_LIB=""

FROM ${REGISTRY_MIRROR_LIB}gradle:9.8-jdk21-alpine AS build
WORKDIR /home/gradle/src
COPY --chown=gradle:gradle *.kts ./
RUN gradle --write-verification-metadata sha256 help -i
COPY --chown=gradle:gradle . ./
RUN gradle bootJar -i --offline

FROM ${REGISTRY_MIRROR_LIB}eclipse-temurin:21.0.12.1_1-jre-ubi10-minimal
COPY --from=build /home/gradle/src/build/libs/ingestor.jar /

CMD java -Xmx256m -jar /ingestor.jar
