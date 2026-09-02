# معماری Gym4Me

## نمای کلان

```text
Mobile (Next + Capacitor) ─┐
Business Panel ────────────┼── REST /api/v1 ── Modular API
Admin Panel ───────────────┘                       │
                                                   ├── MongoDB Replica Set
                                                   ├── Redis
                                                   ├── Object Storage
                                                   └── Transactional Outbox
                                                               │
                                                               ▼
                                                            Worker
                                                               ├── Kavenegar
                                                               ├── Payment Gateway
                                                               ├── Push
                                                               └── Reporting
```

## سبک معماری

نسخه اول یک Modular Monolith است. هر ماژول Domain، Application، Infrastructure و HTTP Adapter خود را دارد. ماژول‌ها جدول یکدیگر را مستقیماً تغییر نمی‌دهند و رخدادهای بین‌دامنه‌ای از Outbox منتشر می‌شوند.

## ماژول‌ها

- Account & Identity
- Access Control
- Dynamic Metadata
- Organizations & Clubs
- Coaches
- Catalog & Discovery
- Availability & Booking
- Pricing
- Finance & Wallet
- Club Memberships
- Corporate Memberships
- Platform Subscriptions
- Advertising
- Reviews
- Notifications
- Verification & Moderation
- Admin & Audit

## سازگاری داده

- Booking، Capacity، Payment، Wallet و Ledger: MongoDB transaction روی Replica Set، همراه با index و invariantهای لایه سرویس.
- Search، Notification، Reporting و Ad metrics: Eventual consistency.
- Redis مرجع نهایی ظرفیت یا موجودی مالی نیست.

## مدل داینامیک

داده به دو بخش تقسیم می‌شود:

1. Core columns برای مالکیت، وضعیت، زمان، مبلغ، ظرفیت و روابط.
2. `customData` به‌صورت MongoDB document برای فیلدهای تعریف‌شده توسط ادمین.

Schema فیلدهای داینامیک نسخه‌بندی می‌شود و Backend تمام ورودی‌ها را با Field Definition فعال اعتبارسنجی می‌کند.

## درخواست API

```text
Request
→ Authentication
→ Active Access Context
→ Permission/Scope Policy
→ Validation
→ Use Case
→ Domain Rules
→ Database Transaction
→ Outbox
→ Response
```

## رزرو

```text
Availability
→ Quote
→ Booking Hold
→ Wallet/Gateway Payment
→ Ledger Post
→ Booking Confirmed
→ Notification
→ Access Pass
→ Check-in / Check-out
```

برای Resource اختصاصی، عدم هم‌پوشانی با Constraint دیتابیس و برای Capacity مشترک با row lock و بررسی اتمیک تضمین می‌شود.

Worker سه مسئولیت idempotent دارد: نگه‌داری lifecycle رزرو/پرداخت، پردازش Transactional Outbox و ارسال NotificationJob. Outbox رخداد دامنه را تحویل می‌دهد و NotificationJob زمان‌بندی، retry، dedupe و نتیجه provider را نگه می‌دارد.

## مالی

`wallet.balance` منبع حقیقت نیست. موجودی از Ledger Entryهای تغییرناپذیر حاصل می‌شود. اصلاح مالی با Reversal/Compensating Transaction انجام می‌شود.

## امنیت

- OTP و Refresh Token به‌صورت Hash ذخیره می‌شوند.
- Password با الگوریتم مقاوم مناسب ذخیره می‌شود.
- Access Token کوتاه‌عمر و Contextدار است.
- Secretهای Provider در API پاسخ داده نمی‌شوند.
- Super Admin به داده تجاری دسترسی کامل دارد، ولی Ledger، Audit، Password، OTP و Token خام قابل ویرایش/مشاهده نیستند.

## مسیر رشد

در مقیاس بالاتر می‌توان Notification، Search، Advertising metrics و Reporting را به سرویس مستقل تبدیل کرد. Booking و Ledger تا زمانی که نیاز عملی اثبات نشده در هسته تراکنشی می‌مانند.
