# Ubuntu VPS deployment

This stack serves:

- Website: `http://185.105.239.140/`
- Admin: `http://185.105.239.140/admin/`
- API: `http://185.105.239.140/api/v1`

The native mobile app is distributed separately, but its production API URL should be
`http://185.105.239.140/api/v1` until a domain and HTTPS are configured.

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

## 2. Get the project

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

## 3. Configure secrets

```bash
cd /opt/gym4me
cp .env.production.example .env.production
openssl rand -base64 48
openssl rand -base64 48
nano .env.production
chmod 600 .env.production
```

Put the two generated values into `JWT_ACCESS_SECRET` and
`JWT_PASSWORD_RESET_SECRET`, and set `KAVENEGAR_API_KEY`. The API intentionally
does not allow mock SMS while running with `NODE_ENV=production`.

## 4. Build and start

```bash
cd /opt/gym4me
# From a machine with npm workspaces installed you can also: npm run docker:prod
docker compose --env-file .env.production \
  -f docker-compose.production.yml up -d --build
docker compose --env-file .env.production \
  -f docker-compose.production.yml ps
```

Check the deployment:

```bash
curl -f http://127.0.0.1/health
curl -f http://127.0.0.1/api/v1
```

View logs:

```bash
docker compose --env-file .env.production \
  -f docker-compose.production.yml logs -f --tail=200
```

## Updating

```bash
cd /opt/gym4me
git pull --ff-only
docker compose --env-file .env.production \
  -f docker-compose.production.yml up -d --build --remove-orphans
docker image prune -f
```

## Backups

Back up MongoDB and uploaded files before updates that change persistent data:

```bash
mkdir -p /opt/backups/gym4me
docker compose --env-file .env.production \
  -f docker-compose.production.yml exec -T mongo \
  mongodump --archive --gzip > /opt/backups/gym4me/mongo-$(date +%F).archive.gz
docker run --rm \
  -v gym4me_gym4me_uploads:/data:ro \
  -v /opt/backups/gym4me:/backup \
  alpine tar czf /backup/uploads-$(date +%F).tar.gz -C /data .
```

## HTTPS

Do not keep authentication or payment traffic on plain HTTP. Point a domain's DNS
record to `185.105.239.140`, change `PUBLIC_URL` and `CORS_ORIGINS` to the HTTPS
domain, then add a TLS reverse proxy such as Caddy or Certbot-managed Nginx. Open
port `443/tcp` only after TLS is configured.
