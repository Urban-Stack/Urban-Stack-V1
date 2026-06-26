# From https://github.com/vercel/next.js/blob/6795597a50112c4f83bf61caf3681e95816da4c9/examples/with-docker/Dockerfile
ARG REGISTRY_MIRROR_LIB=""

# Install dependencies only when needed
FROM ${REGISTRY_MIRROR_LIB}node:24-alpine@sha256:cd6fb7efa6490f039f3471a189214d5f548c11df1ff9e5b181aa49e22c14383e AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# renovate: datasource=npm depName=pnpm
ENV PNPM_VERSION=10.33.4
RUN npm install --global pnpm@"$PNPM_VERSION"

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* preinstall.sh ./
COPY lib ./lib
RUN pnpm run preinstall && \
    pnpm i --frozen-lockfile

# Rebuild the source code only when needed
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN pnpm run build

# Production image, copy all the files and run next
FROM ${REGISTRY_MIRROR_LIB}node:24-alpine@sha256:cd6fb7efa6490f039f3471a189214d5f548c11df1ff9e5b181aa49e22c14383e AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
RUN chmod o+w . .next/required-server-files.json server.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD sed "s/community\\.data-hub\\.local/$IMAGE_DOMAIN_DISCOURSE/g" -i .next/required-server-files.json server.js \
 && sed "s/superset\\.data-hub\\.local/$IMAGE_DOMAIN_SUPERSET/g" -i .next/required-server-files.json server.js \
 && HOSTNAME="0.0.0.0" exec node server.js
