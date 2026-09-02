# Ubuntu VPS deployment

This stack serves subdomain hosts (point DNS A records to `185.105.239.140`):

| Host | App |
|------|-----|
| `http://gym4me.ir` | Website |
| `http://app.gym4me.ir` | Mobile (web) |
| `http://admin.gym4me.ir` | Admin |
| `http://api.gym4me.ir/api/v1` | API |

Native mobile builds should use `API_PUBLIC_URL` + `/api/v1` (same as the web app).

## 1. Prepare Ubuntu

Log in to the server:

```bash
ssh root@185.105.239.140
```

Install Docker from Ubuntu's packages:

```bash
apt update
apt install -y docker.io docker-compose-v2 git ufw
systemctl enable --now docker
ufw allow OpenSSH
ufw allow 80/tcp
ufw --force enable
```

## 2. DNS

At your registrar / DNS panel, create A records:

```text
@       → 185.105.239.140
www     → 185.105.239.140
app     → 185.105.239.140
admin   → 185.105.239.140
api     → 185.105.239.140
```

Wait until `dig +short api.gym4me.ir` returns the VPS IP before relying on hosts.

## 3. Get the project

```bash
mkdir -p /opt/gym4me
git clone https://github.com/hamidYeganeh/Gym4Me.git /opt/gym4me
cd /opt/gym4me
```

If the production work is not yet pushed to GitHub, transfer the working tree from
the development machine instead:

```bash
rsync -az --exclude node_modules --exclude .git \
  ./ root@185.105.239.140:/opt/gym4me/
```

## 4. Configure secrets

```bash
cd /opt/gym4me
cp .env.production.example .env.production
openssl rand -base64 48
openssl rand -base64 48
nano .env.production
chmod 600 .env.production
```

Set:

- `WEBSITE_URL`, `APP_URL`, `ADMIN_URL`, `API_PUBLIC_URL`, `CORS_ORIGINS`
- `MONGODB_URI` — MongoDB Atlas SRV string (see below)
- `JWT_ACCESS_SECRET` and `JWT_PASSWORD_RESET_SECRET` (the two generated values)
- `KAVENEGAR_API_KEY`

### MongoDB Atlas (production default)

1. Create a cluster + database user in [MongoDB Atlas](https://cloud.mongodb.com/).
2. Network Access → add the VPS IP `185.105.239.140` (or your current server IP).
3. Database → Connect → Drivers → copy the URI, set the password and database name `gym4me`:

```text
mongodb+srv://USER:PASSWORD@CLUSTER.xxxxx.mongodb.net/gym4me?retryWrites=true&w=majority
```

4. Put that value in `.env.production` as `MONGODB_URI=...`.

Self-hosted Mongo on the VPS is optional (`--profile local-mongo`) and needs
`MONGODB_URI=mongodb://mongo:27017/gym4me?replicaSet=rs0` instead.

The API intentionally does not allow mock SMS while running with `NODE_ENV=production`
and `DEBUG_MODE=false`.

## 5. Build and start

```bash
cd /opt/gym4me
# From a machine with npm workspaces installed you can also: npm run docker:prod
docker compose --env-file .env.production \
  -f docker-compose.production.yml up -d --build
docker compose --env-file .env.production \
  -f docker-compose.production.yml ps
```

### Optional: seed demo data

Idempotent catalog + demo graph (users, clubs, memberships, bookings, wallets…).
Run from a machine that can reach Mongo with the API workspace checked out:

```bash
# Requires MONGODB_URI pointing at the target DB
ALLOW_DEMO_SEED=true npm run db:seed:all -w backend
```

Demo password defaults to `Gym4Me!123` (override with `SEED_DEMO_PASSWORD`).
Production refuses the seed unless `ALLOW_DEMO_SEED=true`.

Check the deployment (from the VPS, Host header required for subdomain routing):

```bash
curl -f http://127.0.0.1/health
curl -f -H 'Host: gym4me.ir' http://127.0.0.1/
curl -f -H 'Host: app.gym4me.ir' http://127.0.0.1/
curl -f -H 'Host: admin.gym4me.ir' http://127.0.0.1/
curl -f -H 'Host: api.gym4me.ir' http://127.0.0.1/api/v1
```

View logs:

```bash
docker compose --env-file .env.production \
  -f docker-compose.production.yml logs -f --tail=200
```

## Updating

Use [`update-runbook.md`](./update-runbook.md) for production updates. It includes:

- local validation and Git release preparation;
- individual deployment commands for website, mobile web, admin, and API;
- an all-four deployment sequence;
- database and uploads backups;
- health checks, logs, public smoke tests, and rollback;
- native Android/iOS release notes and troubleshooting.

## Backups

Back up MongoDB and uploaded files before updates that change persistent data.

Atlas (default) — dump from any machine that can reach the cluster:

```bash
mkdir -p /opt/backups/gym4me
# Load MONGODB_URI from .env.production, then:
mongodump --uri="$MONGODB_URI" --archive=/opt/backups/gym4me/mongo-$(date +%F).archive.gz --gzip
```

Self-hosted (`--profile local-mongo`):

```bash
docker compose --env-file .env.production \
  -f docker-compose.production.yml --profile local-mongo exec -T mongo \
  mongodump --archive --gzip > /opt/backups/gym4me/mongo-$(date +%F).archive.gz
```

Uploads:

```bash
docker run --rm \
  -v gym4me_gym4me_uploads:/data:ro \
  -v /opt/backups/gym4me:/backup \
  alpine tar czf /backup/uploads-$(date +%F).tar.gz -C /data .
```

## HTTPS

Do not keep authentication or payment traffic on plain HTTP.

1. Open TLS: `ufw allow 443/tcp`
2. Issue certificates (Certbot or Caddy) for `gym4me.ir`, `www.gym4me.ir`,
   `app.gym4me.ir`, `admin.gym4me.ir`, and `api.gym4me.ir`
3. Switch every URL in `.env.production` to `https://…` and rebuild so
   baked-in client `NEXT_PUBLIC_*` / `VITE_*` values match:

```bash
# Example after TLS is live:
WEBSITE_URL=https://gym4me.ir
APP_URL=https://app.gym4me.ir
ADMIN_URL=https://admin.gym4me.ir
API_PUBLIC_URL=https://api.gym4me.ir
CORS_ORIGINS=https://gym4me.ir,https://www.gym4me.ir,https://app.gym4me.ir,https://admin.gym4me.ir
```

```bash
docker compose --env-file .env.production \
  -f docker-compose.production.yml up -d --build
```
