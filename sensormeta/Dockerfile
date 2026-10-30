ARG REGISTRY_MIRROR_LIB=""

FROM ${REGISTRY_MIRROR_LIB}python:3.14-alpine@sha256:601e99e090cb08c2784a42395487709500bc39930307fe72f3f11a8f3c430762 AS builder

RUN apk add --no-cache gcc musl-dev postgresql-dev

RUN pip install virtualenv

WORKDIR /python_app

RUN virtualenv .venv

COPY /app/requirements.txt requirements.txt

RUN source .venv/bin/activate && pip install -r requirements.txt

FROM ${REGISTRY_MIRROR_LIB}python:3.14-alpine@sha256:601e99e090cb08c2784a42395487709500bc39930307fe72f3f11a8f3c430762

WORKDIR /python_app

ENV PYTHONUNBUFFERED=1

RUN apk add libpq lz4-libs && apk upgrade && rm -rf /var/cache/apk

COPY --from=builder /python_app/ /python_app/
COPY /app/ docker-entrypoint.sh /python_app/

CMD ["./docker-entrypoint.sh"]
