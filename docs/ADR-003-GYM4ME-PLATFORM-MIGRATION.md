# ADR-003: استقرار مستقیم Backend فعلی در Gym4Me

**وضعیت:** پذیرفته‌شده برای اجرا  
**تاریخ:** ۲۰۲۶-۰۹-۰۱  
**تصمیم‌گیر:** مالک محصول Gym4Me

## زمینه

Gym4Me باید از یک اپ متمرکز بر تجربه عضو باشگاه به یک پلتفرم چندطرفه تبدیل شود که ورزشکار، مربی، مالک باشگاه، پرسنل عملیاتی و ادمین پلتفرم را پشتیبانی کند.

این مخزن در حال حاضر هسته دامنه، API، Worker، اپ موبایل، پنل باشگاه و پنل ادمین را دارد. هدف این است که Backend موجود بدون بازنویسی سرویس‌ها یا mapping با Backend دیگری، مستقیماً Backend رسمی Gym4Me شود و کلاینت‌های Gym4Me به قراردادهای فعلی آن متصل شوند.

## تصمیم

### ۱. هسته فعلی، Backend اصلی Gym4Me می‌شود

- `apps/api` تنها ورودی عمومی دامنه‌ها زیر `/api/v1` خواهد بود.
- `apps/worker` مسئول Outbox، اعلان‌ها، انقضای Hold/Payment، No-show و پردازش‌های زمان‌بندی‌شده باقی می‌ماند.
- MongoDB Replica Set منبع حقیقت داده‌های تراکنشی است.
- Redis فقط برای cache، coordination و کارهای موقت استفاده می‌شود و مرجع ظرفیت یا موجودی مالی نیست.
- منطق Booking، Membership، Finance، RBAC و Verification داخل کلاینت‌ها تکرار نمی‌شود.
- هیچ Backend موازی یا compatibility layer برای سرویس قبلی ساخته نمی‌شود.
- مدل‌ها، endpointها و use caseهای فعلی مبنا هستند؛ تغییر فقط برای نیاز واقعی UI یا provider production انجام می‌شود.

### ۲. محصولات کاربری کاملاً جدا می‌مانند

```text
Gym4Me Mobile (Athlete + Coach)
              │
Gym4Me Business Panel (Owner + Staff)
              ├──── @gym4me/api ──── REST /api/v1
Gym4Me Admin Panel (Platform Admin)
              │
Integrations / Public Website
```

| محصول          | مسئولیت                                                                      | موارد ممنوع                             |
| -------------- | ---------------------------------------------------------------------------- | --------------------------------------- |
| Mobile         | کشف، رزرو، پرداخت، عضویت، کیف پول، تمرین، نقش مربی                           | مدیریت عملیاتی باشگاه و تنظیمات سراسری  |
| Business Panel | شعب، منابع، خدمات، تقویم، رزرو، اعضا، مربیان، مالی و تسویه                   | مدیریت کاربران و تنظیمات کل پلتفرم      |
| Admin Panel    | Moderation، Verification، RBAC، Audit، Ledger، Settlement و تنظیمات داینامیک | عملیات روزمره یک باشگاه بدون Scope صریح |

### ۳. قرارداد مشترک به‌جای اتصال مستقیم UI به جزئیات Backend

- `packages/contracts` قراردادهای DTO، status و enumهای عمومی را نگه می‌دارد.
- `packages/api` تنها مسیر مجاز فراخوانی API در هر سه کلاینت است.
- هر قابلیت جدید باید ابتدا قرارداد، سپس API/Use Case و بعد UI داشته باشد.
- کلاینت‌ها حق استفاده مستقیم از MongoDB، ساخت URL پراکنده یا محاسبه مبلغ و ظرفیت را ندارند.
- تغییرات ناسازگار با نسخه جدید API منتشر می‌شوند؛ `/api/v1` در زمان مهاجرت پایدار می‌ماند.

### ۴. فیلدهای Gym4Me به Core و Dynamic تقسیم می‌شوند

فیلدهای زیر ثابت و محافظت‌شده هستند:

- شناسه، مالکیت، Organization/Club/Branch scope
- وضعیت و تاریخچه lifecycle
- زمان، ظرفیت، مبلغ، ارز و روابط مالی
- Booking allocation، Membership usage و Ledger entry
- Permission، RoleAssignment و Audit metadata

فیلدهای نمایشی یا قابل سفارشی‌سازی در `customData` و Meta Schema قرار می‌گیرند:

- اطلاعات تکمیلی پروفایل باشگاه و مربی
- امکانات، ویژگی‌ها و برچسب‌های نمایشی
- فرم‌های احراز یا ثبت‌نام اختصاصی
- تنظیمات محتوایی هر رشته یا نوع خدمت

ادمین می‌تواند schema و نمایش این فیلدها را تغییر دهد، اما نمی‌تواند invariant رزرو و مالی را با فیلد داینامیک دور بزند.

### ۵. روش انتقال مستقیم

بخش‌های زیر با همین ساختار و تاریخچه به کدبیس Gym4Me منتقل یا به‌عنوان Backend همان محصول نگهداری می‌شوند:

- `apps/api`
- `apps/worker`
- `packages/database`
- `packages/contracts`
- `packages/rbac`
- `packages/api`
- تنظیمات root شامل TypeScript، Docker، environment و workspace scripts

پس از انتقال، service layer اپ موبایل، Business Panel و Admin Panel مستقیماً از `packages/api` استفاده می‌کند. سرویس قدیمی معادل ساخته نمی‌شود و APIها از ابتدا بازنویسی نمی‌شوند.

## اتصال محصولات

### اپ موبایل Gym4Me

نسخه جدید باید این navigation سطح اول را داشته باشد:

- خانه
- کشف
- رزروها
- تمرین
- حساب

کیف پول، عضویت، QR، اعلان‌ها و نقش مربی از داخل این مسیرها قابل دسترس‌اند. عملیات مالک باشگاه از اپ حذف و به Business Panel منتقل می‌شود.

### پنل بیزینس

Scope فعال همیشه در header مشخص است:

```text
Organization → Club → Branch
```

ماژول‌های اصلی:

- داشبورد زنده
- شعب و اطلاعات مجموعه
- منابع، خدمات و ظرفیت
- تقویم و رزروها
- اعضا، عضویت‌ها و قراردادها
- مربیان و ارتباط مربی–شاگرد
- QR و پذیرش
- مالی، کمیسیون و تسویه
- نظرات، اعلان‌ها و تبلیغات
- پرسنل، Role و Permission

پنل بیزینس سیستم منابع انسانی نیست؛ حقوق، مرخصی و شیفت در این Scope قرار ندارند.

### پنل ادمین

ماژول‌های اصلی:

- داشبورد پلتفرم و سلامت سرویس‌ها
- کاربران، نقش‌ها، Permission و Impersonation
- سازمان‌ها، باشگاه‌ها و احراز
- کاتالوگ ورزش و Meta Builder
- رزرو و عملیات پشتیبانی
- Ledger، Payment، Refund و Settlement
- مربیان، نظرات، تبلیغات و Moderation
- Notification templates و Delivery monitoring
- Audit و Feature Flag

هر mutation حساس نیازمند Permission، Scope، Reason و Audit است.

## ترتیب اجرایی

### فاز صفر: آماده‌سازی

- قرارگرفتن سورس فعلی Gym4Me در workspace
- انتقال مستقیم workspaceهای Backend و تنظیم dependencyهای آن‌ها
- تنظیم environmentهای MongoDB، Redis، Object Storage، پیامک، پرداخت و Push
- اجرای build، index sync، seed، health check و تست‌های فعلی

### فاز یک: اتصال موبایل

- به‌روزرسانی service layer اپ برای استفاده از `@gym4me/api`
- اتصال auth و session به `@gym4me/api/account`
- اتصال پروفایل، کشف، رزرو، عضویت، کیف پول و اعلان‌ها
- انتقال محاسبات قیمت/ظرفیت از UI به API
- حفظ برنامه تمرینی فعلی Gym4Me تا پیاده‌سازی Training Domain جدید

### فاز دو: جداسازی پنل بیزینس

- حذف routeها و permissionهای مالک باشگاه از bundle موبایل
- انتقال عملیات شعبه، تقویم، پذیرش، عضویت و مالی به Business Panel
- اجباری‌کردن Organization/Club/Branch scope در تمام query و mutationها

### فاز سه: بازطراحی ادمین

- اتصال کامل به API مشترک و حذف write مستقیم به داده
- اعمال RBAC، reason، audit و محافظت از فیلدهای حساس
- تبدیل dashboardها از فرم‌های CRUD خام به workflowهای moderation و support

### فاز چهار: تکمیل مزیت رقابتی

- Training Plan، Workout Logging و Progress
- Nutrition و Measurement
- درگاه واقعی و webhook امضاشده
- Push production و delivery reconciliation
- Public Website و SEO

## معیارهای تحویل

هر محصول زمانی به Backend متصل‌شده محسوب می‌شود که:

- API idempotency و permission تست شده باشد؛
- loading، empty، error و offline state داشته باشد؛
- تست E2E مسیر موفق و خطا موجود باشد؛
- observability و audit آماده باشد؛
- هیچ fetch مستقیم، endpoint تکراری یا محاسبه تجاری داخل UI باقی نمانده باشد.

## پیامدها

### مزایا

- سه محصول مستقل با یک منطق تجاری و قرارداد مشترک
- جلوگیری از اختلاف مبلغ، ظرفیت و وضعیت بین اپ و پنل‌ها
- توسعه سریع‌تر فیچرهای چندنقشی
- امکان رشد تدریجی بدون هزینه زودهنگام Microservice

### هزینه‌ها و ریسک‌ها

- نیاز به هماهنگ‌کردن runtime و dependencyهای کدبیس Gym4Me با Monorepo فعلی
- تغییر قراردادهای فعلی UI Gym4Me برای مصرف API موجود
- نیاز جدی به staging و تست E2E
- اضافه‌شدن Training و Nutrition به هسته فعلی برای حفظ مزیت Gym4Me موجود

## اطلاعات لازم برای شروع اجرای کد

- سورس یا مسیر workspace اپ فعلی Gym4Me
- مشخصات bundle/package و فرآیند انتشار iOS و Android
- تنظیمات providerهای production برای پرداخت، پیامک، Push و Object Storage
