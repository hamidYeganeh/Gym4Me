# Gym4Me Mobile — Next.js static export served by nginx (same artifact as Capacitor webDir)
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
RUN --mount=type=cache,target=/root/.npm printf '%s\n' \
  "registry=${NPM_CONFIG_REGISTRY}" \
  'replace-registry-host=always' \
  'fetch-retries=8' \
  'fetch-retry-mintimeout=20000' \
  'fetch-retry-maxtimeout=180000' \
  > .npmrc \
  && npm ci --workspace=mobile --include-workspace-root --omit=dev --ignore-scripts \
  && npm install --no-save --ignore-scripts --workspaces=false \
    typescript@5.9.2 \
    @types/node@20 \
    @types/react@19 \
    @types/react-dom@19 \
    babel-plugin-react-compiler@1.0.0 \
    @tailwindcss/postcss@4

FROM node:22-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/mobile/node_modules ./apps/mobile/node_modules
COPY package.json package-lock.json turbo.json ./
COPY apps/mobile ./apps/mobile
COPY packages ./packages

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build --workspace=mobile

FROM nginx:1.28-alpine AS runner
COPY deploy/mobile.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/mobile/out /usr/share/nginx/html

EXPOSE 80
