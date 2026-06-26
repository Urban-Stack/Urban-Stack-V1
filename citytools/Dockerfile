FROM ${REGISTRY_MIRROR_LIB}busybox:1.37.0 as masterportal

WORKDIR /masterportal
RUN wget https://bitbucket.org/geowerkstatt-hamburg/masterportal/downloads/examples-3.8.0.zip && unzip examples-3.8.0.zip

FROM ${REGISTRY_MIRROR}joseluisq/static-web-server:2.42.0

ENV SERVER_PORT=3000

COPY redirect.toml /redirect.toml
ENV SERVER_CONFIG_FILE=/redirect.toml

COPY --from=masterportal /masterportal/ /public/masterportal
