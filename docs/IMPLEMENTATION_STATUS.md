# وضعیت پیاده‌سازی و آمادگی انتشار

آخرین بازبینی: ۱۴۰۵/۰۶/۱۱ (۲۰۲۶-۰۹-۰۲)

## جمع‌بندی

دامنه‌های مصوب P0 و P1 در کد تکمیل شده‌اند. مسیرهای اصلی روی MongoDB Replica Set واقعی در ۱۷ checkpoint یکپارچه اجرا شده‌اند. پرداخت عمداً فقط درگاه تستی داخلی با دو تصمیم `approve` و `cancel` است و هیچ اتصال زرین‌پال یا درگاه واقعی در Scope فعلی وجود ندارد.

## P0 — تکمیل‌شده

- Account/Auth شامل OTP کاوه‌نگار، رمز عبور، refresh rotation، logout، session و Access Context.
- RBAC و Scope سمت Backend، Audit عملیات مدیریتی و جداسازی tenantها.
- سازمان، باشگاه، شعبه، پرسنل، منابع، خدمات، availability و moderation ادمین.
- رزرو کامل شامل Quote، Hold، Checkout، تأیید/لغو درگاه تستی، لغو، جابه‌جایی، waitlist و claim.
- عضویت و شارژ کیف پول با همان درگاه تستی approve/cancel.
- Access Pass امن، QR check-in، check-out و تاریخچه حضور.
- Ledger دوطرفه و append-only، Invoice، Refund، Settlement و Outbox تراکنشی.
- پنل ادمین P0/P1، پنل کسب‌وکار و اپ موبایل به SDK/API جدید متصل‌اند.
- فرایند رزرو موبایل به صفحات خدمت، زمان، مرور، پرداخت و نتیجه تقسیم شده است.
- عملیات روزانه پنل کسب‌وکار به صفحات مستقل ساخت رزرو، پذیرش، جابه‌جایی و لغو تقسیم شده است.
- Static Export موبایل ۲۰۹ صفحه را تولید می‌کند و artifactهای ضروری را fail-closed کنترل می‌کند.

## P1 — تکمیل‌شده

- SDK تایپ‌شده و React Query برای Account، Organization، Supply، Commerce، Membership، Finance، Notification و دامنه‌های مدیریتی.
- اعلان in-app، پیامک تراکنشی کاوه‌نگار، Push مستقیم FCM/APNs و Webhook fallback.
- ثبت، نوسازی و revoke توکن Push در اپ Capacitor و پاک‌سازی توکن نامعتبر سمت Worker؛ Android permission/plugin و iOS APNs capability/callback نیز تنظیم شده‌اند.
- deep-link پوش فقط از مسیرهای allowlist‌شده پذیرفته می‌شود.
- health/readiness، metrics، Docker Production، smoke، backup/restore و k6 smoke در مخزن موجود است.
- تست providerها، idempotency، ledger، sandbox gateway، mappingهای SDK و interactionهای UI سبز هستند.

## شواهد آخرین تأیید

- `npm test`: ۴۸ suite و ۲۰۸ test موفق.
- typecheck همه workspaceهای فعال موفق.
- build API، Worker، SDK، Admin، Business، Website و Mobile موفق.
- Mobile: ۲۰۹ route در Static Export و کنترل artifact موفق.
- Android debug APK با Firebase Android config واقعی و اجرای موفق `processDebugGoogleServices` ساخته شد.
- FCM HTTP v1 با Service Account کم‌دسترسی و OAuth واقعی تأیید شد؛ ارسال به توکن مصنوعی طبق انتظار با خطای invalid-token از خود FCM رد شد و در نتیجه مسیر احراز هویت و دسترسی ارسال واقعی است.
- آخرین اجرای ثبت‌شده `npm audit --audit-level=high`: صفر آسیب‌پذیری؛ در این بازبینی dependency جدیدی اضافه نشد.
- تست یکپارچه واقعی: ۱۷ checkpoint روی MongoDB Replica Set، شامل قرارداد OpenAPI، Auth و password state، پروفایل، آپلود/metadata/content، رزرو، پرداخت تستی، جابه‌جایی، عضویت، کیف پول، waitlist، check-in/out، ledger، invoice، outbox، SMS/Push/in-app و device lifecycle.

## کارهای محیطی پیش از انتشار عمومی

این موارد نقص پیاده‌سازی P0/P1 نیستند و به credential یا زیرساخت مقصد نیاز دارند:

1. ساخت هفت قالب نوشته‌شده در `docs/KAVENEGAR_TEMPLATES.md` و فعال‌کردن آن‌ها در پنل کاوه‌نگار. کلید محلی با `account/info` رسمی معتبر و دارای اعتبار تأیید شده است.
2. ثبت یک FCM token از دستگاه Android واقعی و تأیید دریافت نوتیفیکیشن انتها-به‌انتها. تنظیم Firebase، Service Account و مجوز HTTP v1 انجام شده است.
3. طبق تصمیم فعلی محصول، APNs موقتاً متوقف است؛ برای فعال‌سازی به Apple Developer login، APNs Key، Xcode کامل و Provisioning Profile دارای Push Notifications نیاز دارد.
4. ساخت iOS Archive روی ماشینی با Xcode کامل و Signing معتبر. web assetها و کد native کپی شده‌اند، اما `pod install`/archive روی این ماشین به‌علت نبود Xcode کامل اجرا نمی‌شود.
5. اجرای k6 و backup/restore در Staging مقصد و ثبت نتیجه.
6. تنظیم دامنه، TLS، Secret Manager و انتشار Store/Production.

## خارج از P0/P1

- شبکه اجتماعی، برنامه تمرینی و تغذیه پیشرفته.
- Platform subscription و Entitlementهای پولی Gym4Me.
- شیفت، مرخصی، حقوق و دستمزد و فرایندهای HR.
