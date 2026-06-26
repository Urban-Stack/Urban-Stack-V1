ARG REGISTRY_MIRROR_LIB=""

FROM ${REGISTRY_MIRROR_LIB}python:3.14.4-alpine AS builder

RUN apk add --no-cache gcc musl-dev postgresql-dev

RUN pip install virtualenv

WORKDIR /python_app

RUN virtualenv .venv

COPY /app/requirements.txt requirements.txt

RUN source .venv/bin/activate && pip install -r requirements.txt

FROM ${REGISTRY_MIRROR_LIB}python:3.14.4-alpine

WORKDIR /python_app

ENV PYTHONUNBUFFERED=1

RUN apk add libpq lz4-libs && apk upgrade && rm -rf /var/cache/apk

COPY --from=builder /python_app/ /python_app/
COPY /app/ docker-entrypoint.sh /python_app/

CMD ["./docker-entrypoint.sh"]
