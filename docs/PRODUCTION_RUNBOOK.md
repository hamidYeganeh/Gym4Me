# راهنمای انتشار و عملیات Production

## وضعیت پیاده‌سازی

- API دارای liveness، readiness متصل به MongoDB و metrics با احراز Bearer است.
- Worker دارای health server مستقل، metrics، shutdown صحیح و شمارنده خطاهاست.
- Prometheus و Grafana با profile اختیاری `monitoring` آماده‌اند.
- API و Worker در کانتینر با کاربر non-root، capability حذف‌شده و Swagger خاموش اجرا می‌شوند.
- Push مستقیم FCM HTTP v1 و APNs Token Auth و Webhook fallback پشتیبانی می‌شود.
- OTP و SMS تراکنشی کاوه‌نگار timeout، retry و reconciliation دارند.

## Secretهای الزامی

فایل `.env.production` نباید commit شود. حداقل این مقادیر را در Secret Manager یا محیط استقرار قرار دهید:

```dotenv
NODE_ENV=production
JWT_ACCESS_SECRET=<random-64-plus-characters>
METRICS_TOKEN=<random-32-plus-characters>
CORS_ALLOWED_ORIGINS=https://app.example.com,https://business.example.com,https://admin.example.com
TRUST_PROXY=true
SWAGGER_ENABLED=false

OTP_PROVIDER=kavenegar
NOTIFICATION_PROVIDER=kavenegar
KAVENEGAR_API_KEY=<secret>
KAVENEGAR_OTP_TEMPLATE=gym4meotp
KAVENEGAR_TEMPLATE_BOOKING_CONFIRMED=gym4mebookingconfirmed
KAVENEGAR_TEMPLATE_BOOKING_REMINDER=gym4mebookingreminder
KAVENEGAR_TEMPLATE_BOOKING_CANCELLED=gym4mebookingcancelled
KAVENEGAR_TEMPLATE_BOOKING_RESCHEDULED=gym4mebookingrescheduled
KAVENEGAR_TEMPLATE_WAITLIST_AVAILABLE=gym4mewaitlist
KAVENEGAR_TEMPLATE_PAYMENT_FAILED=gym4mepaymentfailed
KAVENEGAR_SENDER=<approved-sender>

PUSH_PROVIDER=direct
FCM_PROJECT_ID=<firebase-project-id>
FCM_CLIENT_EMAIL=<service-account-email>
FCM_PRIVATE_KEY=<service-account-private-key>
# Alternative/preferred: mount the ignored JSON file read-only into the Worker.
FCM_SERVICE_ACCOUNT_FILE_HOST=./apps/worker/.secrets/firebase-push-service-account.json
APNS_TEAM_ID=<apple-team-id>
APNS_KEY_ID=<apns-key-id>
APNS_BUNDLE_ID=com.gym4me.app
APNS_PRIVATE_KEY=<p8-private-key>
APNS_ENVIRONMENT=production
APNS_ENABLED=false
```

کلید Firebase باید فقط مجوز ارسال Firebase Cloud Messaging داشته باشد. تا زمان آماده‌شدن Apple، مقدار `APNS_ENABLED=false` اجازه می‌دهد Worker با FCM-only به‌صورت fail-closed اجرا شود. هنگام فعال‌سازی، `APNS_ENABLED=true` و هر چهار credential اپل الزامی‌اند. کلید APNs باید از Apple Developer ساخته شود. در Android فایل `google-services.json` در `apps/mobile/android/app/` قرار می‌گیرد و commit نمی‌شود. Entitlement پوش iOS داخل پروژه فعال شده، ولی Provisioning Profile باید Push Notifications را داشته باشد.

توکن `METRICS_TOKEN` را با newline پایانی در `secrets/metrics_token` نیز قرار دهید تا Prometheus بتواند scrape کند:

```bash
mkdir -p secrets
printf '%s' "$METRICS_TOKEN" > secrets/metrics_token
```

## انتشار

```bash
docker compose -f docker-compose.production.yml config
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d
BASE_URL=https://api.example.com/api/v1 npm run smoke
```

برای مانیتورینگ داخلی:

```bash
GRAFANA_ADMIN_PASSWORD='<strong-password>' docker compose -f docker-compose.production.yml --profile monitoring up -d
```

پورت‌های API، Prometheus و Grafana فقط روی loopback bind شده‌اند؛ TLS و دسترسی عمومی باید در Load Balancer یا Reverse Proxy مدیریت شود.

## چک‌لیست انتشار

### پیش از انتشار

- [x] `npm run lint`, `npm run check-types`, `npm test` و `npm run build` سبز هستند.
- [ ] backup جدید گرفته و restore آن در محیط جداگانه آزمایش شده است.
- [ ] indexهای MongoDB با `npm run db:indexes` همگام شده‌اند.
- [ ] Secretهای Production و originهای CORS بازبینی شده‌اند.
- [x] درگاه تستی approve/cancel روی MongoDB Replica Set واقعی تأیید شده است.
- [x] احراز هویت و مجوز ارسال FCM HTTP v1 و Android Firebase config تأیید شده‌اند.
- [ ] دریافت Push روی دستگاه Android واقعی در staging تأیید شود.
- [ ] هفت قالب کاوه‌نگار ساخته شوند و OTP/اعلان روی شماره تست تأیید شود.
- [ ] APNs پس از رفع توقف فعلی محصول، با دستگاه iOS واقعی تأیید شود.
- [ ] برنامه rollback و نسخه قبلی image ثبت شده است.

### هنگام انتشار

- [ ] ابتدا staging و سپس یک instance canary منتشر شود.
- [ ] `/api/v1/health`, `/api/v1/health/live` و `/health/ready` Worker بررسی شوند.
- [ ] smoke test اجرا شود.
- [ ] نرخ 5xx، latency، loop errorهای Worker و backlog اعلان‌ها حداقل ۱۵ دقیقه مشاهده شوند.

### محرک‌های Rollback

- نرخ 5xx بیش از ۲٪ برای ۵ دقیقه.
- unavailable شدن API یا Worker بیش از ۲ دقیقه.
- latency میانگین بیش از ۷۵۰ms برای ۱۰ دقیقه یا p95 بیش از ۱ ثانیه.
- هرگونه ثبت دوباره پرداخت، عدم تراز Ledger یا oversell ظرفیت.
- شکست ارسال OTP در بیش از ۵٪ درخواست‌ها.

## تست بار

پس از seed کردن staging و بدون اتصال به Production:

```bash
BASE_URL=https://staging-api.example.com/api/v1 npm run load:smoke
```

آستانه فعلی: خطای کمتر از ۱٪، p95 کمتر از ۵۰۰ms و p99 کمتر از ۱ ثانیه. برای checkout مالی، تست جداگانه فقط با درگاه تستی داخلی و idempotency keyهای یکتا اجرا شود.

## Backup و Restore

```bash
MONGODB_URI='<uri>' BACKUP_DIR=/secure/backups ./scripts/backup-mongodb.sh
CONFIRM_RESTORE=RESTORE_GYM4ME MONGODB_URI='<staging-uri>' BACKUP_FILE='<archive>' ./scripts/restore-mongodb.sh
```

Backup باید رمزنگاری، خارج از میزبان اصلی نگهداری و حداقل ماهانه restore آزمایشی شود. `restore-mongodb.sh` داده مقصد را با `--drop` جایگزین می‌کند و فقط با تأیید صریح اجرا می‌شود.
