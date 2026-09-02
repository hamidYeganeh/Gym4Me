FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
RUN npm ci
RUN npm run build -w @gym4me/api-server -w @gym4me/worker
RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN groupadd --system --gid 10001 gym4me && useradd --system --uid 10001 --gid gym4me --home-dir /app gym4me
COPY --from=build --chown=gym4me:gym4me /app /app
USER gym4me

FROM runtime AS api
EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]

FROM runtime AS worker
EXPOSE 4001
CMD ["node", "apps/worker/dist/index.js"]
