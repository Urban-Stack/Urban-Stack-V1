ARG REGISTRY_MIRROR_LIB="" \
    REGISTRY_MIRROR=""

ARG SCHEDULER_REPO=https://github.com/teutonet/jupyter-scheduler.git \
    SCHEDULER_BRANCH=release-v2.11.0-teuto \
    SCHEDULER_COMMIT=9f9232490544e8b624fef6ca19130ceba56c6415

FROM ${REGISTRY_MIRROR}alpine/git:v2.52.0 AS jupyter_scheduler_source

ARG SCHEDULER_REPO \
    SCHEDULER_BRANCH \
    SCHEDULER_COMMIT

WORKDIR /project

RUN echo "$SCHEDULER_BRANCH @ $SCHEDULER_COMMIT from $SCHEDULER_REPO" \
        && git clone --depth 1 --single-branch --branch $SCHEDULER_BRANCH $SCHEDULER_REPO

FROM ${REGISTRY_MIRROR_LIB}node:24-trixie AS prepare_jupyter_scheduler_builder

RUN apt-get update \
        && apt-get install -y python3 python3-pip \
        && rm -rf /var/lib/apt/lists/*

FROM prepare_jupyter_scheduler_builder AS jupyter_scheduler_builder

WORKDIR /project

COPY --from=jupyter_scheduler_source /project/jupyter-scheduler /project/jupyter-scheduler

WORKDIR /project/jupyter-scheduler

RUN pip wheel --no-deps .

FROM quay.io/jupyter/scipy-notebook:hub-5.2.1 AS legal-labextension-builder
# renovate: datasource=conda depName=nodejs
ENV NODEJS_VERSION=22.13.0

COPY legal-links/ /legal
RUN mamba install conda-forge::nodejs=$NODEJS_VERSION \
 && jupyter labextension install /legal \
 && rm -rf /opt/conda/share/jupyter/lab/staging/node_modules

FROM quay.io/jupyter/scipy-notebook:hub-5.2.1

COPY --from=legal-labextension-builder /opt/conda/share/jupyter/lab /opt/conda/share/jupyter/lab

# renovate: datasource=pypi depName=requests_oauthlib
ENV OAUTHLIB_VERSION=2.0.0
# renovate: datasource=pypi depName=boto3
ENV BOTO_VERSION=1.43.5
# renovate: datasource=pypi depName=gql
ENV GQL_VERSION=4.0.0
# renovate: datasource=pypi depName=jupyterlab-visualpython
ENV VISUALPYTHON_VERSION=3.0.2

RUN pip install "boto3==$BOTO_VERSION" \
        "gql[requests]==$GQL_VERSION" \
        "jupyterlab-visualpython==$VISUALPYTHON_VERSION" \
        "requests_oauthlib==$OAUTHLIB_VERSION" \
        && jupyter labextension disable "@jupyterlab/apputils-extension:announcements"

# fix CVE-2025-43859
# renovate: datasource=pypi depName=h11
ENV H11_VERSION=0.16.0
RUN pip install "h11==$H11_VERSION"

USER root

RUN apt-get update \
    && apt-get install --yes nodejs \
    && rm -rf /var/lib/apt/lists/*

USER jovyan

# install patched jupyter_scheduler
ARG JUPYTER_SCHEDULER_VERSION=2.11.0

COPY --from=jupyter_scheduler_builder \
     --chown=jovyan:users \
     /project/jupyter-scheduler/jupyter_scheduler-${JUPYTER_SCHEDULER_VERSION}-py3-none-any.whl \
     /tmp/jupyter-scheduler/

WORKDIR /tmp/jupyter-scheduler

RUN pip install jupyter_scheduler-${JUPYTER_SCHEDULER_VERSION}-py3-none-any.whl \
    && jupyter server extension enable --py jupyter_scheduler

USER root

RUN mkdir /platform_lib
ENV PYTHONPATH=/platform_lib
COPY lib.py /platform_lib/_.py

USER $NB_UID

WORKDIR /home/jovyan
