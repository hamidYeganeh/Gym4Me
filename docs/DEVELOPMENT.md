# راهنمای توسعه

## سرویس‌ها

```bash
docker compose up -d mongodb mongodb-init redis
```

## دیتابیس

```bash
npm run db:generate
npm run db:indexes
npm run db:seed
```

## Bootstrap ادمین

پس از Seed، متغیرهای `BOOTSTRAP_ADMIN_MOBILE` و `BOOTSTRAP_ADMIN_PASSWORD` را تنظیم و `npm run admin:bootstrap` را اجرا کنید. این فرمان Idempotent است و هیچ حساب یا رمز پیش‌فرضی در پروژه وجود ندارد.

## اجرا

```bash
npm run dev:api
npm run dev:worker
npm run dev:mobile
npm run dev:business
npm run dev:admin
```

## بررسی کیفیت

```bash
npm run typecheck
npm run test
npm run build
```

## Migration

- Migration تولیدشده پیش از Merge بازبینی شود.
- تغییر Ledger و Booking constraint نیازمند تست هم‌زمانی است.
- حذف ستون داینامیک با Archive کردن Field Definition انجام می‌شود، نه حذف فوری داده.

## افزودن Endpoint

1. Route contract و Validation را تعریف کنید.
2. Permission لازم را به Catalog اضافه کنید.
3. Use Case را مستقل از HTTP بنویسید.
4. Transaction و Outbox را در یک مرز ثبت کنید.
5. تست Happy path، Permission و Conflict را اضافه کنید.
