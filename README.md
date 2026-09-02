# Gym4Me

زیرساخت نسخه تجاری اول اکوسیستم Gym4Me. این مخزن یک Monorepo شامل API، Worker، اپ موبایل ورزشکار/مربی، پنل باشگاه و پنل ادمین است.

## وضعیت فعلی

- معماری Modular Monolith و مرز دامنه‌ها تعریف شده است.
- مدل‌های دامنه‌ای MongoDB/Mongoose در `packages/database` قرار دارند.
- API شامل Account/Auth، RBAC، سازمان/باشگاه، Coach، Supply، Booking، Membership، Finance، Advertising، Verification، Review، Notification و Upload است.
- اپ موبایل Next.js برای Static Export و Capacitor آماده شده است.
- هر سه UI به SDK/API جدید متصل‌اند و دامنه‌های P0/P1 تکمیل شده‌اند. وضعیت دقیق و گیت‌های محیطی انتشار در `docs/IMPLEMENTATION_STATUS.md` ثبت می‌شود.

## ساختار مخزن

```text
apps/
  api/             NestJS REST API (Fastify adapter)
  worker/          پردازش Outbox و کارهای پس‌زمینه
  mobile/          Next.js + Capacitor (Athlete/Coach)
  business-panel/  پنل باشگاه و پرسنل
  admin/           پنل مدیریت پلتفرم
packages/
  api/             کلاینت مشترک API و TanStack Query بر اساس دامنه
  ui/              کامپوننت‌ها و الگوهای UI مشترک
  theme/           توکن‌ها و استایل مشترک
docs/               مستندات محصول، معماری، API و داده
```

## اجرای محلی

پیش‌نیازها: Node.js، Docker و npm.

```bash
cp .env.example .env
npm install
docker compose up -d mongodb mongodb-init redis
npm run db:indexes
npm run db:seed
npm run dev:api
```

ساخت اولین Super Admin، بدون رمز پیش‌فرض:

```bash
BOOTSTRAP_ADMIN_MOBILE=+989xxxxxxxxx \
BOOTSTRAP_ADMIN_PASSWORD='a-strong-password' \
npm run admin:bootstrap
```

Swagger در حالت توسعه:

```text
http://localhost:4000/docs
```

Health check:

```text
GET http://localhost:4000/api/v1/health
```

## اپ موبایل و Capacitor

```bash
npm run build -w mobile
npm run cap:sync -w mobile
```

خروجی وب موبایل در `apps/mobile/out` ساخته می‌شود و Capacitor همین پوشه را با `webDir: "out"` مصرف می‌کند.
رجیستری Push با `@capacitor/push-notifications` فعال است. Worker با `PUSH_PROVIDER=direct` مستقیماً FCM/APNs را پشتیبانی می‌کند و با `PUSH_PROVIDER=webhook` نیز می‌تواند از gateway بیرونی استفاده کند.

ساخت APK دیباگ Android:

```bash
npm run android:apk -w mobile
```

خروجی در `apps/mobile/artifacts/android/Gym4Me-debug.apk` قرار می‌گیرد. ساخت iOS archive به نصب Xcode کامل و CocoaPods سالم نیاز دارد.

## دسترسی به API در اپ‌ها

اپ موبایل، پنل کسب‌وکار و پنل ادمین از `@repo/api` استفاده می‌کنند. مسیر جدید توسعه از exportهای `@repo/api/v2` و ماژول‌های `features/*` استفاده می‌کند. SDK قدیمی فقط برای مهاجرت تدریجی نگهداری می‌شود و نباید برای صفحه جدید استفاده شود.

```tsx
import { useProfileQuery } from "@repo/api/v2";

const profile = useProfileQuery({ enabled: Boolean(accessToken) });
```

آدرس پایه در هر اپ از `NEXT_PUBLIC_API_URL` خوانده می‌شود. برای درخواست‌های جدید، URL یا `fetch` مستقیم داخل اپ تعریف نکنید؛ تابع API، query key و hook مربوط را در دامنه مناسب داخل `packages/api/src/features` اضافه کنید.

پنل کسب‌وکار پس از ورود، Organization و Scope را از Access Context می‌گیرد و نشست v2 را در storage همان اپ نگه می‌دارد. اپ موبایل و پنل ادمین نیز مسیرهای P0/P1 را از همین قرارداد مصرف می‌کنند.

## مستندات

- [نیازمندی‌های محصول](docs/PRODUCT_REQUIREMENTS.md)
- [معماری سیستم](docs/ARCHITECTURE.md)
- [مرجع API](docs/API.md)
- [مدل داده و داینامیک‌سازی](docs/DATA_MODEL.md)
- [RBAC و Scope](docs/RBAC.md)
- [راهنمای توسعه](docs/DEVELOPMENT.md)
- [تصمیم‌های معماری](docs/DECISIONS.md)
- [وضعیت پیاده‌سازی](docs/IMPLEMENTATION_STATUS.md)
- [راهنمای Production و عملیات](docs/PRODUCTION_RUNBOOK.md)
- [راهبرد تست](docs/TEST_STRATEGY.md)
