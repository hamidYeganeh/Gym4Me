# Production update and deployment runbook

Use this runbook to update one or more Gym4Me applications on the production VPS.
Initial server provisioning, DNS, TLS, and secret setup are documented in
[`ubuntu-vps.md`](./ubuntu-vps.md).

## Scope

| Application | Compose service | Public URL | Container |
|---|---|---|---|
| Marketing website | `website` | `https://gym4me.ir` | `gym4me-website-1` |
| Mobile web app | `mobile` | `https://app.gym4me.ir` | `gym4me-mobile-1` |
| Admin panel | `admin` | `https://admin.gym4me.ir` | `gym4me-admin-1` |
| API | `api` | `https://api.gym4me.ir/api/v1` | `gym4me-api-1` |

The `mobile` service is the web build served by the VPS. Native Android and iOS
releases use Capacitor and are not deployed to the VPS; see
[Native mobile releases](#native-mobile-releases).

MongoDB, Redis, and the Nginx gateway are supporting services. Do not restart or
recreate them for a normal application-only deployment.

## Deployment rules

- Treat Git as the source of truth. Commit and push locally, then pull on the VPS.
- Keep `.env.production` only on the VPS. Never commit or overwrite it during an update.
- Deploy only the services that changed.
- Back up MongoDB and uploads before API changes that may affect persistent data.
- Do not prune old images until the new containers are healthy and rollback images exist.
- Client-visible API changes should be backward compatible while website, mobile, and
  admin containers are being replaced.

## Prerequisites

You need:

- permission to push to `origin/main`;
- SSH access to `root@185.105.239.140`;
- Docker and Docker Compose on the VPS;
- a complete `/opt/gym4me/.env.production` file;
- working outbound network access from Docker during image builds.

The production Compose file validates variables for every service while parsing it.
Even a frontend-only deployment requires all mandatory API variables, including:

- `JWT_ACCESS_SECRET`;
- `JWT_PASSWORD_RESET_SECRET`;
- `KAVENEGAR_API_KEY`;
- `ZARINPAL_MERCHANT_ID`;
- `FCM_SERVICE_ACCOUNT`;
- `CORS_ORIGINS` and the four public URL variables.

## 1. Prepare and test the change locally

From the repository root:

```bash
cd /Users/mahdi/Documents/projects/Gym4Me
git status
git diff
npm run check-types
```

Run the build for every application affected by the change:

```bash
# Marketing website
npm run build --workspace=website

# Mobile web app
npm run build --workspace=mobile

# Admin panel
npm run build --workspace=admin

# API
npm run build --workspace=api
npm test --workspace=api
```

Shared package changes under `packages/` may affect multiple applications. When in
doubt, build all four:

```bash
npm run build
```

## 2. Commit and push

Stage only the intended files:

```bash
git add <files-to-deploy>
git commit -m "Describe the production update"
git push origin main
```

Record the commit for the deployment log:

```bash
git rev-parse --short HEAD
```

## 3. Connect and run preflight checks

```bash
ssh root@185.105.239.140
cd /opt/gym4me
```

The production checkout should not contain application source changes:

```bash
git status --short
git log -1 --oneline
```

Do not run `git reset --hard` on an unexpected dirty checkout. Inspect the changes and
preserve anything that is not known deployment residue.

Validate the production environment without printing secret values:

```bash
chmod 600 .env.production
docker compose --env-file .env.production \
  -f docker-compose.production.yml config --quiet
```

Confirm that Docker can reach the npm registry before building the Node applications:

```bash
docker run --rm node:22-bookworm-slim \
  node -e "fetch('https://registry.npmjs.org/next').then(r=>{console.log(r.status);process.exit(r.ok?0:1)}).catch(e=>{console.error(e);process.exit(1)})"
```

Expected output:

```text
200
```

If this test times out, stop. Fix Docker egress, firewall, DNS, or registry-mirror
configuration before starting a production build. The existing containers can remain
online while the build path is repaired.

Check current service health:

```bash
docker compose --env-file .env.production \
  -f docker-compose.production.yml ps
```

## 4. Back up persistent data when required

This step is required before API changes that may alter stored data, uploads, payment
state, memberships, bookings, or authentication behavior. It is optional for a
frontend-only deployment.

```bash
mkdir -p /opt/backups/gym4me

# Atlas (default): dump with the production URI
set -a && source .env.production && set +a
mongodump --uri="$MONGODB_URI" \
  --archive=/opt/backups/gym4me/mongo-$(date +%F-%H%M).archive.gz --gzip

# Self-hosted mongo (--profile local-mongo) alternative:
# docker compose --env-file .env.production \
#   -f docker-compose.production.yml --profile local-mongo exec -T mongo \
#   mongodump --archive --gzip \
#   > /opt/backups/gym4me/mongo-$(date +%F-%H%M).archive.gz

docker run --rm \
  -v gym4me_gym4me_uploads:/data:ro \
  -v /opt/backups/gym4me:/backup \
  alpine tar czf /backup/uploads-$(date +%F-%H%M).tar.gz -C /data .
```

Verify that the backup files are present and non-empty:

```bash
ls -lh /opt/backups/gym4me
```

## 5. Pull the release

```bash
git fetch origin
git pull --ff-only origin main
git log -1 --oneline
```

Confirm that the displayed commit is the commit pushed in step 2.

## 6. Create rollback images

Snapshot only the applications being updated. `docker commit` is used because it also
works when the original image tag has already been pruned.

```bash
# Run the applicable commands only.
docker commit gym4me-website-1 gym4me-website:rollback
docker commit gym4me-mobile-1 gym4me-mobile:rollback
docker commit gym4me-admin-1 gym4me-admin:rollback
docker commit gym4me-api-1 gym4me-api:rollback
```

Application data remains in MongoDB and the uploads volume; the API rollback image is
not a database backup.

## 7. Build and deploy

Set these shortcuts once per SSH session:

```bash
COMPOSE_FILE=docker-compose.production.yml
ENV_FILE=.env.production
```

### Website only

```bash
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build website
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-deps website
```

### Mobile web app only

```bash
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build mobile
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-deps mobile
```

### Admin panel only

```bash
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build admin
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-deps admin
```

### API only

Ensure MongoDB and Redis are already healthy, then run:

```bash
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps mongo redis
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build api
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-deps api
```

### All four applications

Build all images before replacing any running container:

```bash
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  build api website mobile admin
```

If the API contract remains compatible with the current clients, replace the API first,
then the three clients:

```bash
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-deps api

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-deps website mobile admin
```

If the gateway configuration also changed, recreate it only after all four applications
are healthy:

```bash
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-deps gateway
```

## 8. Verify the deployment

Check Docker health:

```bash
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
```

Every updated container should become `healthy`. Inspect failing services before moving
on:

```bash
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  logs --tail=200 website mobile admin api
```

Check the internal gateway. HTTP may return `301` or `308` when TLS redirection is active:

```bash
curl -sS -o /dev/null -w 'website: %{http_code}\n' \
  -H 'Host: gym4me.ir' http://127.0.0.1/

curl -sS -o /dev/null -w 'mobile: %{http_code}\n' \
  -H 'Host: app.gym4me.ir' http://127.0.0.1/

curl -sS -o /dev/null -w 'admin: %{http_code}\n' \
  -H 'Host: admin.gym4me.ir' http://127.0.0.1/

curl -sS -o /dev/null -w 'api: %{http_code}\n' \
  -H 'Host: api.gym4me.ir' http://127.0.0.1/api/v1/ready
```

Verify public HTTPS:

```bash
curl -fsS -o /dev/null -w 'website: %{http_code} %{time_total}s\n' \
  https://gym4me.ir/

curl -fsS -o /dev/null -w 'mobile: %{http_code} %{time_total}s\n' \
  https://app.gym4me.ir/

curl -fsS -o /dev/null -w 'admin: %{http_code} %{time_total}s\n' \
  https://admin.gym4me.ir/

curl -fsS -o /dev/null -w 'api: %{http_code} %{time_total}s\n' \
  https://api.gym4me.ir/api/v1/ready
```

Expected public status is `200`. Also perform a short browser smoke test:

- load the website home page and one dynamic club or coach page;
- sign in to the mobile web app and open a page that calls the API;
- sign in to admin and load a data table;
- exercise the API behavior changed by the release.

## 9. Roll back an application

Rollback tags are local to the VPS. Run only the commands for the failed application.

```bash
# Website
docker tag gym4me-website:rollback gym4me-website:latest
docker compose --env-file .env.production -f docker-compose.production.yml \
  up -d --no-deps --force-recreate website

# Mobile web app
docker tag gym4me-mobile:rollback gym4me-mobile:latest
docker compose --env-file .env.production -f docker-compose.production.yml \
  up -d --no-deps --force-recreate mobile

# Admin panel
docker tag gym4me-admin:rollback gym4me-admin:latest
docker compose --env-file .env.production -f docker-compose.production.yml \
  up -d --no-deps --force-recreate admin

# API
docker tag gym4me-api:rollback gym4me-api:latest
docker compose --env-file .env.production -f docker-compose.production.yml \
  up -d --no-deps --force-recreate api
```

Re-run the verification commands after rollback. If an API release changed persistent
data, restoring the API image may not be sufficient; assess and restore the MongoDB or
uploads backup separately.

## 10. Finish and clean up

After all services have remained healthy and smoke tests pass:

```bash
git status --short
docker compose --env-file .env.production \
  -f docker-compose.production.yml ps
docker image prune -f
```

Keep the tagged `:rollback` images until the next successful deployment.

Record at least:

- deployment time;
- Git commit;
- applications deployed;
- operator;
- backup filenames, if created;
- verification result;
- any rollback or incident notes.

## Native mobile releases

Updating the `mobile` Docker service changes only `https://app.gym4me.ir`. It does not
publish a new Android or iOS binary.

Build native artifacts from the development machine:

```bash
# Android release artifacts
npm run mobile:android:apk:release
npm run mobile:android:aab

# iOS archive/IPA; requires macOS and signing configuration
npm run mobile:ios:ipa
```

Native builds must use `https://api.gym4me.ir/api/v1` as their production API endpoint.
Distribute Android and iOS artifacts through their normal signed release channels.

## Common failures

### Compose reports a missing variable

Example:

```text
required variable FCM_SERVICE_ACCOUNT is missing a value
```

Complete `.env.production` with the real production value. Do not deploy the API with
placeholder credentials.

### A Docker build stalls at `npm ci`

Run the Docker registry preflight from step 3. Compare it with host connectivity:

```bash
curl -4 -fsSI --max-time 15 https://registry.npmjs.org/next
```

If the host succeeds and Docker fails, investigate Docker forwarding, DNS, firewall,
proxy, and registry-mirror configuration. Keep the old production containers running.

### A container is `unhealthy`

```bash
docker inspect <container-name> --format '{{json .State.Health}}'
docker logs --tail=200 <container-name>
```

Do not restart MongoDB, Redis, or the gateway unless the logs show that they are part of
the failure.

### `git pull --ff-only` fails because the VPS checkout is dirty

```bash
git status --short
git diff
```

Identify who owns the server-side changes. Commit, copy, or otherwise preserve them
before restoring specific known files. Never use a broad destructive reset without
confirming the exact files that will be lost.
