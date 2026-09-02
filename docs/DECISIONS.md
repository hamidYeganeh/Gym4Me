# تصمیم‌های معماری

## PostgreSQL به‌جای MongoDB — منسوخ‌شده

این تصمیم با انتخاب جدید MongoDB در ADR-002 جایگزین شده است.

## ADR-002: NestJS و MongoDB

**وضعیت:** پذیرفته‌شده  
**تاریخ:** ۲۰۲۶-۰۸-۳۱

API مرکزی با NestJS و Fastify adapter ساخته می‌شود. MongoDB منبع اصلی داده است و با Replica Set اجرا می‌شود تا transactionهای چند-document برای رزرو و مالی قابل استفاده باشند. مدل‌ها براساس دامنه جدا شده‌اند، داده‌های مرتبط در subdocument و extensionهای کنترل‌شده در `customData` قرار می‌گیرند. به‌جای `isActive` از فیلد توسعه‌پذیر `status` استفاده می‌شود.

پیامدها:

- توسعه schemaهای داینامیک و داده‌های تو‌در‌تو ساده‌تر است.
- join و constraintهای دیتابیس رابطه‌ای دیگر در دسترس نیست و باید با transaction، unique/index و invariant لایه سرویس جبران شود.
- Ledger فقط از Posting Service نوشته می‌شود و تراز debit/credit پیش از ثبت بررسی خواهد شد.
- جلوگیری قطعی از overbooking باید با transaction و سند ظرفیت/slot اتمیک پیاده‌سازی شود؛ index زمانی به‌تنهایی کافی نیست.

## Modular Monolith

در نسخه اول، Booking و Finance باید در یک مرز تراکنشی قابل اعتماد باشند. مرز ماژول‌ها از ابتدا حفظ می‌شود، ولی هزینه عملیاتی Microservice زودهنگام پذیرفته نمی‌شود.

## Core + Dynamic Extensions

همه‌چیز در یک جدول generic یا EAV ذخیره نمی‌شود. مالکیت، مبلغ، زمان، ظرفیت، وضعیت حساس و Foreign Keyها ثابت‌اند. فیلدهای قابل توسعه در `custom_data` و تحت کنترل نسخه‌بندی Schema قرار می‌گیرند.

## Status به‌جای Boolean lifecycle

چرخه عمر با `status_code` و تاریخچه Transition مدل می‌شود. Boolean فقط برای ویژگی مستقل مانند `is_required` یا `is_system` استفاده می‌شود.

## Next.js + Capacitor

اپ موبایل Next.js یک Static Client است و هیچ Server Action یا API Route محلی ندارد. API مستقل است. خروجی `out` داخل پروژه‌های Android و iOS کپی می‌شود. Routeهای داده‌محور موبایل از Query parameter استفاده می‌کنند تا به Static generation شناسه‌های آینده وابسته نباشند.

## یک اپ مشترک Athlete/Coach

Persona و Access Context از Backend دریافت می‌شود و کاربر می‌تواند بین Athlete و Coach جابه‌جا شود. پنل باشگاه و پنل ادمین محصول‌های جدا هستند.

## مرز پنل باشگاه با منابع انسانی

پنل باشگاه برای مدیریت عملیات باشگاه و ارتباط با ورزشکاران و شاگردان طراحی می‌شود، نه مدیریت منابع انسانی. پرسنل فقط از نظر دعوت، عضویت سازمانی، Scope و RBAC مدیریت می‌شوند. شیفت، مرخصی، حقوق و دستمزد و فرایندهای مشابه در Scope محصول نیستند.

## تعویق پلن‌های پولی Gym4Me

مدل‌های اولیه Platform Plan و Subscription حفظ می‌شوند، اما API، Entitlement Guard و UI آن‌ها تا تصمیم‌گیری محصولی بعدی توسعه داده نمی‌شوند.

## Admin access with invariants

Super Admin دارای `*` و Scope سراسری است، اما Password، OTP، Token و Secret خام قابل مشاهده نیستند. Ledger و Audit append-only هستند و اصلاح مالی فقط با Reversal و Reason انجام می‌شود.

## API organization

تمام مسیرها زیر `/api/v1/{domain}` قرار می‌گیرند. Account، Booking، Finance، Memberships، Subscriptions، Advertising، Admin و Integrations namespace مستقل دارند. Commandهای مالی و رزروی Idempotent هستند.
