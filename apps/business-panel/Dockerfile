# Gym4Me Business Panel — Vite static build served by nginx
FROM node:22-bookworm-slim AS deps
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
COPY apps/api/package.json apps/api/
COPY apps/admin/package.json apps/admin/
COPY apps/business-panel/package.json apps/business-panel/
COPY apps/mobile/package.json apps/mobile/
COPY apps/website/package.json apps/website/
COPY apps/worker/package.json apps/worker/
COPY packages/api/package.json packages/api/
COPY packages/eslint-config/package.json packages/eslint-config/
COPY packages/fonts/package.json packages/fonts/
COPY packages/i18n/package.json packages/i18n/
COPY packages/icons/package.json packages/icons/
COPY packages/theme/package.json packages/theme/
COPY packages/typescript-config/package.json packages/typescript-config/
COPY packages/ui/package.json packages/ui/

RUN --mount=type=cache,id=gym4me-business-npm,target=/root/.npm,sharing=locked \
  npm ci --workspace=business-panel --include-workspace-root --no-audit --no-fund

FROM node:22-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/business-panel/node_modules ./apps/business-panel/node_modules
COPY package.json package-lock.json turbo.json ./
COPY apps/business-panel ./apps/business-panel
COPY packages ./packages

ARG VITE_API_BASE_URL
ARG VITE_BASE_PATH=/
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_BASE_PATH=$VITE_BASE_PATH

RUN npm run build --workspace=business-panel

FROM nginx:1.28-alpine AS runner
COPY deploy/admin.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/business-panel/dist /usr/share/nginx/html

EXPOSE 80
