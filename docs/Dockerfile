FROM ${REGISTRY_MIRROR}squidfunk/mkdocs-material:9.7.6 AS build

RUN pip install mkdocs-render-swagger-plugin mkdocs-print-site-plugin

# patch template https://github.com/bharel/mkdocs-render-swagger-plugin/blob/0f57755af4c9fa7c2c9cf817ab1dfe3168355996/render_swagger.py
COPY swagger-oauth.diff /
RUN git -C "$(pip show mkdocs-render-swagger-plugin | grep Location | awk '{print $2}')" apply /swagger-oauth.diff

COPY user/ /docs/
RUN find -name '*.md' -o -name '*.json' \
    | xargs sed -i "s/DOCS_BASE_DOMAIN/urbanstack.de/g" \
    && mkdocs build --strict >/output 2>&1

RUN ! grep 'does not contain an anchor' /output

FROM ${REGISTRY_MIRROR}joseluisq/static-web-server:2.42.0
ENV SERVER_PORT=3000

COPY --from=build /docs/site/ /public
