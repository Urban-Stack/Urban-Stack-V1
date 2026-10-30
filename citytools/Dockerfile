FROM ${REGISTRY_MIRROR_LIB}busybox:1.38.0 as masterportal

WORKDIR /masterportal
RUN wget https://bitbucket.org/geowerkstatt-hamburg/masterportal/downloads/examples-3.8.0.zip && unzip examples-3.8.0.zip

FROM ${REGISTRY_MIRROR_LIB}nginx:1.31.8-alpine@sha256:785835ea65db4bba6f021acc0f3be91b0fef76a53fe41f8588c6698d2aed0606

RUN apk upgrade --no-cache

COPY --from=masterportal /masterportal/ /etc/nginx/html/masterportal
