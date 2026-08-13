# Gym4Me Website — Next.js standalone production image
FROM node:22-bookworm-slim AS deps
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
COPY apps/api/package.json apps/api/
COPY apps/admin/package.json apps/admin/
COPY apps/mobile/package.json apps/mobile/
COPY apps/website/package.json apps/website/
COPY packages/api/package.json packages/api/
COPY packages/eslint-config/package.json packages/eslint-config/
COPY packages/fonts/package.json packages/fonts/
COPY packages/i18n/package.json packages/i18n/
COPY packages/icons/package.json packages/icons/
COPY packages/theme/package.json packages/theme/
COPY packages/typescript-config/package.json packages/typescript-config/
COPY packages/ui/package.json packages/ui/

# Lockfile pins registry.npmjs.org; project .npmrc mirror rewrites hosts and can 404.
RUN printf '%s\n' \
  'registry=https://registry.npmjs.org/' \
  'fetch-retries=8' \
  'fetch-retry-mintimeout=20000' \
  'fetch-retry-maxtimeout=180000' \
  > .npmrc \
  && npm ci --workspace=website --include-workspace-root

FROM node:22-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/website/node_modules ./apps/website/node_modules
COPY package.json package-lock.json turbo.json ./
COPY apps/website ./apps/website
COPY packages ./packages

ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build --workspace=website

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
ENV INTERNAL_API_BASE_URL=http://api:8088/api/v1
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/website/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/website/.next/static ./apps/website/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/website/public ./apps/website/public

USER nextjs
EXPOSE 8080
CMD ["node", "apps/website/server.js"]
