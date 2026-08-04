# Gym4Me — چک‌لیست یوزر استوری × اپ

علائم: ✅ انجام‌شده · 🟡 ناقص (schema / UI mock / API بدون UI) · ❌ شروع‌نشده · — بی‌ربط

> schema دامنه در Prisma تقریباً کامل است؛ رانتایم فعلی فقط هویت/ادمین/basics روی MongoDB پیاده شده و موبایل هنوز به API وصل نیست.

| استوری | api | mobile | admin | website |
|--------|-----|--------|-------|---------|
| A1 ورود OTP | ✅ | ❌ | — | — |
| A2 رمز عبور | ✅ | ❌ | 🟡 UI ورود | — |
| A3 پروفایل پایه | ✅ | ❌ | — | — |
| A4 سوئیچ نقش + توکن | ✅ | ❌ | — | — |
| A5 KYC | ✅ | ❌ | ❌ UI | — |
| A6 دعوت با کد معرف | ✅ | ❌ | — | — |
| B1 پروفایل ورزشکار | 🟡 schema | 🟡 UI mock | — | — |
| B2–B3 پروفایل/تأیید مربی | 🟡 schema | 🟡 UI mock | ❌ | — |
| B4–B5 ساخت باشگاه/مدارک | 🟡 schema | 🟡 UI mock | ❌ | — |
| C1–C2 جست‌وجوی باشگاه | ❌ | 🟡 UI mock | — | ❌ |
| C3–C4 جست‌وجوی مربی | ❌ | 🟡 UI mock | — | ❌ |
| C5 صفحات SEO | — | — | — | 🟡 لندینگ |
| D1–D9 رزروها | 🟡 schema | ❌ | ❌ | — |
| D10 check-in | 🟡 schema | ❌ | — | — |
| D11 تأیید مربی | 🟡 schema | ❌ | — | — |
| SYS-D12/13 قفل/TTL | ❌ | — | — | — |
| E1–E4 عضویت باشگاه | 🟡 schema | ❌ | ❌ | — |
| F1–F3 اشتراک پلتفرم | 🟡 schema | ❌ | ❌ | ❌ |
| G1 بانک حرکات | 🟡 schema | — | ❌ | — |
| G2–G8 برنامه تمرینی | 🟡 schema | ❌ | — | — |
| H1–H5 متریک/پیشرفت | 🟡 schema | 🟡 UI mock | — | — |
| H6 MetricType | 🟡 schema | — | ❌ | — |
| I1–I3 تغذیه | 🟡 schema | ❌ | ❌ | — |
| J1–J6 اجتماعی | 🟡 schema | ❌ | ❌ | — |
| K1 فضا/سانس | 🟡 schema | 🟡 UI mock | — | — |
| K2 پرسنل + مجوز | 🟡 schema | ❌ | — | — |
| K3–K8 عملیات باشگاه | 🟡 schema | ❌ | ❌ | — |
| L1 زرین‌پال | 🟡 gateway stub | ❌ | — | — |
| L2 کیف پول | 🟡 schema | ❌ | ❌ | — |
| L3 Ledger | 🟡 schema | — | — | — |
| L4–L8 کمیسیون/تسویه | 🟡 schema | ❌ | ❌ | — |
| M1 CRUD کاربران | ✅ | — | ❌ UI | — |
| M2 تأیید KYC | ✅ | — | ❌ UI | — |
| M3 دادهٔ مرجع | ✅ | — | ❌ UI | — |
| M4 تأیید UGC | 🟡 schema | — | ❌ | — |
| M5 impersonation | 🟡 schema | — | ❌ | — |
| M6 AuditLog نمایش | ✅ ثبت | — | ❌ | — |
| M7–M10 CMS/گزارش/تیکت | 🟡 schema | — | ❌ | — |
| N1 اعلان تراکنشی | 🟡 schema | ❌ | ❌ | — |
| N2 کاوه‌نگار | ✅ درایور | — | — | — |
| N3 inbox | 🟡 schema | ❌ | — | — |
| N4 پیام مربی-شاگرد | 🟡 schema | ❌ | — | — |
| O1 پرداخت حضوری/ترکیبی | ❌ | — | ❌ | — |
| O2–O15 عملیات واقعی باشگاه | ❌ | ❌ | ❌ | — |
| P1–P12 کسب‌وکار/کیفیت مربی | ❌ | ❌ | ❌ | — |
| Q1–Q12 اعتماد/سلامت ورزشکار | 🟡 بخشی در schema | ❌ | ❌ | 🟡 بخشی از discovery |
| R1–R2 event/attribution | ❌ | ❌ | ❌ | ❌ |
| R3–R7 lifecycle delivery | ❌ | ❌ | ❌ | — |
| R8–R9 referral reward | ❌ (invite بدون reward ✅) | ❌ | ❌ | ❌ |
| R10–R12 analytics/expansion | ❌ | ❌ | ❌ | — |

## شکاف‌های فوری فاز ۱

1. اتصال `apps/mobile` به API احراز هویت
2. UI پنل ادمین برای کاربران/KYC/basics (سرویس‌ها آماده‌اند)
3. فعال‌سازی واقعی `SMS_PROVIDER=kavenegar` در محیط staging
4. تکمیل پروفایل‌های نقش (B) روی API رانتایم
5. تعریف و ثبت eventهای سروری و attribution پیش از شروع acquisition پولی
6. حفظ `referralCode` و `referredBy` در طرح مهاجرت MongoDB → PostgreSQL
