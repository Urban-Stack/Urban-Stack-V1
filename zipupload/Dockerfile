ARG REGISTRY_MIRROR_LIB=""

FROM ${REGISTRY_MIRROR_LIB}python:3.15-alpine@sha256:0aa144e9ec2ae8fd80dfd94070ef3e432a0df17b6e5e0091dc05323974ce9913 as builder

RUN apk add --no-cache gcc musl-dev

RUN pip install virtualenv

WORKDIR /python_app

RUN virtualenv .venv

COPY /app/requirements.txt requirements.txt

RUN source .venv/bin/activate && pip install -r requirements.txt

FROM ${REGISTRY_MIRROR_LIB}python:3.15-alpine@sha256:0aa144e9ec2ae8fd80dfd94070ef3e432a0df17b6e5e0091dc05323974ce9913

WORKDIR /python_app

ENV PYTHONUNBUFFERED=1

# mailcap for mime types
RUN apk add lz4-libs mailcap && apk upgrade && rm -rf /var/cache/apk

COPY --from=builder /python_app/ /python_app/
COPY /app/ docker-entrypoint.sh /python_app/

CMD ["./docker-entrypoint.sh"]
