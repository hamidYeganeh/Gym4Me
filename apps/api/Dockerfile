# Gym4Me API — production image
FROM node:22-bookworm-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
# Keep workspace graph resolvable for npm ci
COPY apps/admin/package.json apps/admin/
COPY apps/mobile/package.json apps/mobile/
COPY apps/website/package.json apps/website/
COPY packages/eslint-config/package.json packages/eslint-config/
COPY packages/fonts/package.json packages/fonts/
COPY packages/i18n/package.json packages/i18n/
COPY packages/icons/package.json packages/icons/
COPY packages/theme/package.json packages/theme/
COPY packages/typescript-config/package.json packages/typescript-config/
COPY packages/ui/package.json packages/ui/

RUN npm ci --workspace=api --include-workspace-root

FROM node:22-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY package.json package-lock.json ./
COPY apps/api ./apps/api
COPY turbo.json ./

RUN npm run build --workspace=api

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8088
ENV UPLOAD_DIR=/app/uploads

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nestjs \
  && mkdir -p /app/uploads \
  && chown -R nestjs:nodejs /app

COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nestjs:nodejs /app/package.json ./package.json

USER nestjs
EXPOSE 8088
CMD ["node", "apps/api/dist/main.js"]
