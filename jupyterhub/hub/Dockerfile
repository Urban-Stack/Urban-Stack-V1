# syntax = docker/dockerfile:1.23
# VULN_SCAN_TIME=2025-09-01_05:06:40
ARG REGISTRY_MIRROR_LIB="" \
    REGISTRY_MIRROR=""

ARG JUPYTERHUB_REPO=https://github.com/teutonet/jupyterhub.git \
    JUPYTERHUB_BRANCH=release-5.3.0-teuto \
    JUPYTERHUB_COMMIT=daf196352bc13c8e7cbb88c3e0a9cdebc762281c \
    IDLE_CULLER_REPO=https://github.com/teutonet/jupyterhub-idle-culler.git \
    IDLE_CULLER_BRANCH=release-1.4.0-teuto \
    IDLE_CULLER_COMMIT=8f26f252f150b211545be9e3e66494336b3e16ca \
    RESIDENT_SCHEDULER_REPO=https://github.com/teutonet/jupyterhub-resident-scheduler.git \
    RESIDENT_SCHEDULER_BRANCH=main \
    RESIDENT_SCHEDULER_COMMIT=a7f573e8167f24352ca513bd0217fae75223000f \
    TEUTO_CRON_UTIL_REPO=https://github.com/teutonet/teuto-cron-util.git \
    TEUTO_CRON_UTIL_BRANCH=main \
    TEUTO_CRON_UTIL_COMMIT=b2e93faae5d78f6b6211b42dcb96a0809d1bc6dc

FROM ${REGISTRY_MIRROR}alpine/git:v2.52.0 AS get-source-stage

ARG JUPYTERHUB_REPO \
    JUPYTERHUB_BRANCH \
    JUPYTERHUB_COMMIT \
    IDLE_CULLER_REPO \
    IDLE_CULLER_BRANCH \
    IDLE_CULLER_COMMIT \
    RESIDENT_SCHEDULER_REPO \
    RESIDENT_SCHEDULER_BRANCH \
    RESIDENT_SCHEDULER_COMMIT \
    TEUTO_CRON_UTIL_REPO \
    TEUTO_CRON_UTIL_BRANCH \
    TEUTO_CRON_UTIL_COMMIT

WORKDIR /project

# jupyterhub
RUN echo "clone $JUPYTERHUB_BRANCH @ $JUPYTERHUB_COMMIT from $JUPYTERHUB_REPO" \
        && git clone --depth 1 --revision $JUPYTERHUB_COMMIT $JUPYTERHUB_REPO

# jupyterhub requirements
RUN wget -q https://raw.githubusercontent.com/jupyterhub/zero-to-jupyterhub-k8s/refs/tags/4.2.0/images/hub/requirements.txt

# jupyterhub-idle-culler
RUN echo "clone $IDLE_CULLER_BRANCH @ $IDLE_CULLER_COMMIT from $IDLE_CULLER_REPO" \
        && git clone --depth 1 --single-branch --branch $IDLE_CULLER_BRANCH $IDLE_CULLER_REPO

# jupyterhub-resident-scheduler
RUN echo "clone $RESIDENT_SCHEDULER_BRANCH @ $RESIDENT_SCHEDULER_COMMIT from $RESIDENT_SCHEDULER_REPO" \
        && git clone --depth 1 --single-branch --branch $RESIDENT_SCHEDULER_BRANCH $RESIDENT_SCHEDULER_REPO

# teuto-cron-util
RUN echo "clone $TEUTO_CRON_UTIL_BRANCH @ $TEUTO_CRON_UTIL_COMMIT from $TEUTO_CRON_UTIL_REPO" \
        && git clone --depth 1 --single-branch --branch $TEUTO_CRON_UTIL_BRANCH $TEUTO_CRON_UTIL_REPO

# install build dependencies for jupyterhub
FROM ${REGISTRY_MIRROR_LIB}python:3.13-bookworm as pre-build-stage-deps

RUN apt-get update \
    && apt-get install -y nodejs npm \
    && rm -rf /var/lib/apt/lists/*

FROM pre-build-stage-deps as pre-build-stage

WORKDIR /build

COPY --from=get-source-stage /project/jupyterhub /build/jupyterhub
COPY --from=get-source-stage /project/teuto-cron-util /build/teuto-cron-util
COPY --from=get-source-stage /project/jupyterhub-idle-culler /build/jupyterhub-idle-culler
COPY --from=get-source-stage /project/jupyterhub-resident-scheduler /build/jupyterhub-resident-scheduler

WORKDIR /build/jupyterhub

RUN pip install setuptools \
    && python setup.py bdist_wheel

WORKDIR /build/teuto-cron-util

RUN pip wheel --no-deps .

WORKDIR /build/jupyterhub-idle-culler

RUN pip wheel --no-deps .

WORKDIR /build/jupyterhub-resident-scheduler

RUN pip wheel --no-deps .

# The build stage
# ---------------
# This stage is building Python wheels for use in later stages by using a base
# image that has more pre-requisites to do so, such as a C++ compiler.
#
# NOTE: If the image version is updated, also update it in ci/refreeze and
#       singleuser-sample's Dockerfile!
#
FROM ${REGISTRY_MIRROR_LIB}python:3.13-bookworm as build-stage

# Build wheels
#
# We set pip's cache directory and expose it across build stages via an
# ephemeral docker cache (--mount=type=cache,target=${PIP_CACHE_DIR}). We use
# the same technique for the directory /tmp/wheels.
#
COPY --from=get-source-stage /project/requirements.txt requirements.txt
ARG PIP_CACHE_DIR=/tmp/pip-cache
RUN --mount=type=cache,target=${PIP_CACHE_DIR} \
    pip wheel \
        --wheel-dir=/tmp/wheels \
        # pycurl 7.45.3 has wheels, but they aren't portable
        # https://github.com/pycurl/pycurl/issues/834
        --no-binary pycurl \
        -r requirements.txt \
        # Additional wheels for default-stage. Updates below should be repeated
        # in default-stage.
        #
        "cron-converter==1.2.2" \
        py-spy

# override following wheel packages

ARG JUPYTERHUB_VERSION=5.3.0 \
    JUPYTERHUB_IDLE_CULLER_VERSION=1.4.0 \
    JUPYTERHUB_RESIDENT_SCHEDULER_VERSION=0.1.0 \
    TEUTO_CRON_UTIL_VERSION=0.1.0

# teuto-cron-util
COPY --from=pre-build-stage \
    /build/teuto-cron-util/teuto_cron_util-${TEUTO_CRON_UTIL_VERSION}-py3-none-any.whl \
    /tmp/wheels/teuto_cron_util-${TEUTO_CRON_UTIL_VERSION}-py3-none-any.whl
# jupyterhub-resident-scheduler
COPY --from=pre-build-stage \
    /build/jupyterhub-resident-scheduler/jupyterhub_resident_scheduler-${JUPYTERHUB_RESIDENT_SCHEDULER_VERSION}-py3-none-any.whl \
    /tmp/wheels/jupyterhub_resident_scheduler-${JUPYTERHUB_RESIDENT_SCHEDULER_VERSION}-py3-none-any.whl
# jupyterhub
COPY --from=pre-build-stage \
    /build/jupyterhub/dist/jupyterhub-${JUPYTERHUB_VERSION}-py3-none-any.whl \
    /tmp/wheels/jupyterhub-${JUPYTERHUB_VERSION}-py3-none-any.whl
# jupyterhub-idle-culler
COPY --from=pre-build-stage \
    /build/jupyterhub-idle-culler/jupyterhub_idle_culler-${JUPYTERHUB_IDLE_CULLER_VERSION}-py3-none-any.whl \
    /tmp/wheels/jupyterhub_idle_culler-${JUPYTERHUB_IDLE_CULLER_VERSION}-py3-none-any.whl


# The final stage - slim version
# ------------------------------
# This stage is built and published as quay.io/jupyterhub/k8s-hub-slim. It is meant to
# provide no non-essential packages.
#
FROM ${REGISTRY_MIRROR_LIB}python:3.13-slim-bookworm as slim-stage
ENV DEBIAN_FRONTEND=noninteractive

ARG NB_USER=jovyan \
    NB_UID=1000 \
    HOME=/home/jovyan
RUN adduser \
        --disabled-password \
        --gecos "Default user" \
        --uid ${NB_UID} \
        --home ${HOME} \
        --force-badname \
        ${NB_USER}

RUN apt-get update \
 && apt-get upgrade -y \
 && apt-get install -y --no-install-recommends \
        # requirement for pycurl
        libcurl4 \
        # requirement for using postgres database
        libpq5 \
        # requirement for using a local sqlite database
        sqlite3 \
        tini \
 && rm -rf /var/lib/apt/lists/*


# install wheels built in the build stage
# --no-index ensures _only_ wheels from the build stage are installed

# copy all wheels from build-stage
# because kaniko cant handle RUN --mount options
COPY --from=build-stage \
    /tmp/wheels \
    /tmp/wheels

ARG JUPYTERHUB_RESIDENT_SCHEDULER_VERSION=0.1.0 \
    TEUTO_CRON_UTIL_VERSION=0.1.0

COPY --from=get-source-stage /project/requirements.txt /tmp/requirements.txt

ARG PIP_CACHE_DIR=/tmp/pip-cache
#RUN --mount=type=cache,target=${PIP_CACHE_DIR} \
#    --mount=type=cache,from=build-stage,source=/tmp/wheels,target=/tmp/wheels \
#    pip install \
#        /tmp/jupyterhub-${JUPYTERHUB_VERSION}-py3-none-any.whl \
#        /tmp/jupyterhub_idle_culler-${JUPYTERHUB_IDLE_CULLER_VERSION}-py3-none-any.whl \
#        /tmp/jupyterhub_resident_scheduler-${JUPYTERHUB_RESIDENT_SCHEDULER_VERSION}-py3-none-any.whl \
#        /tmp/teuto_cron_util-${TEUTO_CRON_UTIL_VERSION}-py3-none-any.whl
RUN --mount=type=cache,target=${PIP_CACHE_DIR} \
    --mount=type=bind,from=build-stage,source=/tmp/wheels,target=/tmp/wheels \
    pip install \
        --no-index \
        --find-links=/tmp/wheels/ \
        -r /tmp/requirements.txt \
        /tmp/wheels/jupyterhub_resident_scheduler-${JUPYTERHUB_RESIDENT_SCHEDULER_VERSION}-py3-none-any.whl \
        /tmp/wheels/teuto_cron_util-${TEUTO_CRON_UTIL_VERSION}-py3-none-any.whl

WORKDIR /srv/jupyterhub
RUN chown ${NB_USER}:${NB_USER} /srv/jupyterhub
USER ${NB_USER}

EXPOSE 8081
ENTRYPOINT ["tini", "--"]
CMD ["jupyterhub", "--config", "/usr/local/etc/jupyterhub/jupyterhub_config.py"]


# The final stage - default version
# ---------------------------------
# We add a few non-critical packages on top of the slim version to provide some
# additional utility.
#
FROM slim-stage as default-stage

USER root

# copy all wheels from slim-stage
# because kaniko cant handle RUN --mount options
COPY --from=slim-stage \
    /tmp/wheels \
    /tmp/wheels

ARG PIP_CACHE_DIR=/tmp/pip-cache
RUN --mount=type=cache,target=${PIP_CACHE_DIR} \
    --mount=type=bind,from=build-stage,source=/tmp/wheels,target=/tmp/wheels \
    pip install \
        --no-index \
        --find-links=/tmp/wheels/ \
        # Updates below should be repeated in build-stage.
        #
        # py-spy is useful for profiling performance of running hubs
        py-spy

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
        curl \
        dnsutils \
        git \
        less \
        vim \
 && rm -rf /var/lib/apt/lists/*

COPY --from=pre-build-stage /build/jupyterhub/jupyterhub/alembic.ini /usr/local/lib/python3.13/site-packages/jupyterhub/alembic.ini

COPY hub-legal.patch /
RUN git -C /usr/local/share/jupyterhub/templates apply /hub-legal.patch

USER ${NB_USER}