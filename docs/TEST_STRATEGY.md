# راهبرد تست Gym4Me

## اهداف

- مسیرهای مالی، رزرو و Ledger: پوشش branch حداقل ۹۰٪ و تست integration اجباری.
- Auth، RBAC، عضویت و Notification: پوشش branch حداقل ۸۰٪.
- سایر منطق دامنه: پوشش line حداقل ۷۰٪.
- UI: تست interaction برای مسیرهای ورود، رزرو، پرداخت، لغو و عملیات پذیرش.

درصد پوشش به‌تنهایی معیار انتشار نیست؛ invariantها و حالت‌های شکست باید تست شوند.

## هرم تست

1. Unit: validation، محاسبات مالیات/جریمه، scopeهای RBAC و mappingها.
2. Integration: MongoDB Replica Set واقعی برای transaction، index و idempotency.
3. Contract: قرارداد SDK با تمام endpointهای API.
4. E2E: ورود، رزرو، پرداخت sandbox، Check-in، لغو و Refund.
5. Infrastructure: smoke، backup/restore، shutdown Worker و تست بار k6.

## ماتریس بحرانی

| حوزه   | سناریوهای الزامی                                                                          |
| ------ | ----------------------------------------------------------------------------------------- |
| رزرو   | رقابت روی آخرین ظرفیت، انقضای Hold، retry با idempotency key، رزرو دوره‌ای نیمه‌ناموفق    |
| مالی   | webhook تکراری/نامرتب، timeout provider، refund تکراری، تراز debit/credit، reconciliation |
| Auth   | brute force، OTP منقضی و مصرف‌شده، refresh reuse، session revoke، account suspension      |
| عضویت  | مصرف هم‌زمان آخرین ورود، لغو و آزادسازی، ذی‌نفع خانوادگی، سقف سازمانی                     |
| Worker | crash پس از ارسال و قبل از commit، retry/backoff، stale lock، invalid push token          |
| Upload | magic byte جعلی، path traversal، فایل ناقص/بزرگ، سند احراز عمومی                          |
| دسترسی | cross-tenant read/write، impersonation expiry، role revoke حین session                    |

## Gate انتشار

- همه تست‌های موجود و build باید سبز باشند.
- هیچ finding امنیتی Critical/High باز نباشد.
- تست بار staging آستانه‌های `tests/load/smoke.js` را پاس کند.
- restore آخرین backup و smoke مسیرهای اصلی موفق باشد.
- برای تغییرات رزرو و مالی، تست concurrency و idempotency اجباری است.

## آخرین اجرای محلی

تاریخ: ۲۰۲۶-۰۹-۰۲

| Gate | نتیجه |
| --- | --- |
| `npm run check-types` | همه workspaceهای فعال موفق |
| `npm run lint` | همه workspaceهای دارای lint موفق |
| `npm test` | ۷ مجموعه، ۴۸ suite و ۲۰۸ test موفق |
| `npm run build` | API، Worker، SDK، Admin، Business، Mobile و Website موفق |
| `npm audit --audit-level=high` | صفر آسیب‌پذیری |
| Mobile clean export | ۲۰۹ صفحه و کنترل artifact موفق |
| Capacitor Android sync | موفق، ۹ plugin و Firebase Android config واقعی |
| Android debug APK | Gradle موفق، `processDebugGoogleServices` اجرا شد و APK ساخته شد |
| FCM HTTP v1 | OAuth و مجوز ارسال با Service Account کم‌دسترسی و توکن مصنوعی تأیید شد |
| Capacitor iOS | کپی asset موفق؛ `pod install` و archive به Xcode کامل، APNs credential و Signing نیاز دارد |
| P0 integration | ۱۷ checkpoint، شامل قرارداد OpenAPI، Auth/Profile، Upload و مسیرهای اصلی روی MongoDB Replica Set واقعی موفق |

مواردی که این اجرای محلی پوشش نمی‌دهد: دریافت FCM روی دستگاه Android واقعی، APNs/iOS archive، k6 و backup/restore در Staging مقصد. این موارد همچنان gate انتشار عمومی هستند و با unit/build جایگزین نمی‌شوند.
