FROM ${REGISTRY_MIRROR_LIB}busybox:1.37.0 as masterportal

WORKDIR /masterportal
RUN wget https://bitbucket.org/geowerkstatt-hamburg/masterportal/downloads/examples-3.8.0.zip && unzip examples-3.8.0.zip

FROM ${REGISTRY_MIRROR_LIB}nginx:1.31.2-alpine

COPY --from=masterportal /masterportal/ /etc/nginx/html/masterportal
