FROM ghcr.io/teutonet/oci-images/ckan-dcatapde:1.0.15
LABEL authors="syeklu"

USER root

RUN apt remove -y libsqlite3-0 && apt update && apt upgrade -y

RUN pip3 install -e git+https://github.com/SyeKlu/ckanext-keycloak.git@790a5304047ee04cecf26ec2aadb6f589a03f646#egg=ckanext-keycloak
RUN pip install -r ${SRC_DIR}/ckanext-keycloak/requirements.txt

COPY ./theme ${SRC_DIR}/ckanext-udh_theme
RUN pip3 install -e ${SRC_DIR}/ckanext-udh_theme

COPY --chown=ckan:ckan-sys custom-patch/create.patch ${SRC_DIR}/ckan/create.patch
RUN git -C ${SRC_DIR}/ckan apply create.patch

COPY --chown=ckan:ckan-sys custom-patch/validators.patch ${SRC_DIR}/ckan/validators.patch
RUN git -C ${SRC_DIR}/ckan apply validators.patch

COPY --chown=ckan:ckan-sys custom-patch/security.patch ${SRC_DIR}/ckan/security.patch
RUN git -C ${SRC_DIR}/ckan apply security.patch

COPY --chown=ckan:ckan-sys custom-patch/stats.patch ${SRC_DIR}/ckan/stats.patch
RUN git -C ${SRC_DIR}/ckan apply stats.patch

USER ckan