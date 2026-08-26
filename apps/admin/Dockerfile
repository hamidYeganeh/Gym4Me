# Gym4Me Admin — Vite static build served by nginx
FROM node:22-bookworm-slim AS deps
WORKDIR /app

ARG NPM_CONFIG_REGISTRY=https://registry.npmjs.org/

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

# Production can select a reachable trusted registry without changing source.
RUN --mount=type=cache,id=gym4me-npm-v2,target=/root/.npm,sharing=locked printf '%s\n' \
  "registry=${NPM_CONFIG_REGISTRY}" \
  'replace-registry-host=always' \
  'fetch-retries=8' \
  'fetch-retry-mintimeout=20000' \
  'fetch-retry-maxtimeout=180000' \
  'fetch-timeout=30000' \
  'maxsockets=10' \
  'audit=false' \
  'fund=false' \
  > .npmrc \
  && npm ci --workspace=admin --include-workspace-root

FROM node:22-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/admin/node_modules ./apps/admin/node_modules
COPY package.json package-lock.json turbo.json ./
COPY apps/admin ./apps/admin
COPY packages ./packages

ARG VITE_API_BASE_URL
ARG VITE_BASE_PATH=/
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_BASE_PATH=$VITE_BASE_PATH

RUN npm run build --workspace=admin

FROM nginx:1.28-alpine AS runner
COPY deploy/admin.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html

EXPOSE 80
