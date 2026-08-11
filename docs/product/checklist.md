# Gym4Me — چک‌لیست یوزر استوری × اپ

علائم: ✅ انجام‌شده · 🟡 ناقص (schema / UI mock / API بدون UI) · ❌ شروع‌نشده · — بی‌ربط

> رانتایم فعلی هویت/ادمین/basics/analytics روی MongoDB است. موبایل به API احراز هویت/پروفایل/KYC وصل شده؛ discovery باشگاه/مربی روی API با fallback به mock برای slugهای دمو است.
>
> **Seed دمو:** `npm run db:seed:all -w api` — کاربران همهٔ نقش‌ها (رمز `Gym4Me!123`)، باشگاه‌های تأییدشده/در انتظار/پیش‌نویس، کلاس/سانس، KYC و نظرات. تست فلوها: `apps/api/test/smoke-flows.sh` (نیازمند API در حال اجرا + `DEBUG_MODE=true`). ادمین به‌صورت پیش‌فرض کلاب‌ها را از API واقعی می‌خواند (`VITE_CLUBS_USE_MOCK=true` فقط برای دموی آفلاین).

| استوری | api | mobile | admin | website |
|--------|-----|--------|-------|---------|
| A1 ورود OTP | ✅ | ✅ | — | — |
| A2 رمز عبور | ✅ | 🟡 ورود با رمز | ✅ | — |
| A3 پروفایل پایه | ✅ | ✅ | — | — |
| A4 سوئیچ نقش + توکن | ✅ | ✅ | — | — |
| A5 KYC | ✅ | ✅ | ✅ | — |
| A6 دعوت با کد معرف | ✅ | 🟡 کلاینت API | — | — |
| B1 پروفایل ورزشکار | ✅ | ✅ | — | — |
| B2–B3 پروفایل/تأیید مربی | ✅ | ✅ | ✅ | — |
| B4–B5 ساخت باشگاه/مدارک | ✅ | ✅ | ✅ | — |
| C1–C2 جست‌وجوی باشگاه | ✅ + Q11 filters | 🟡 API + mock + فیلترها + نقشه geo | — | 🟡 SEO /clubs |
| C3–C4 جست‌وجوی مربی | ✅ | 🟡 API + mock fallback | — | 🟡 SEO /coaches |
| C5 صفحات SEO | — | — | — | 🟡 JSON-LD + sitemap + robots |
| D1–D9 رزروها | 🟡 API + verify ledger | 🟡 بخشی UI | ❌ | — |
| D10 check-in | 🟡 API | ❌ | — | — |
| D11 تأیید مربی | 🟡 API | ❌ | — | — |
| SYS-D12/13 قفل/TTL | 🟡 جزئی در booking | — | — | — |
| E1–E4 عضویت باشگاه | 🟡 API | ❌ | ❌ | — |
| F1–F3 اشتراک پلتفرم | 🟡 API | ❌ | 🟡 admin plans | ❌ |
| G1 بانک حرکات | 🟡 API | — | 🟡 admin | — |
| G2–G8 برنامه تمرینی | 🟡 WorkoutPlan + WorkoutProgram template | 🟡 programs UI←API | — | — |
| H1–H5 متریک/پیشرفت | 🟡 API | 🟡 UI + catalog/order API | — | — |
| H6 MetricType | ✅ MetricType catalog + seed | 🟡 reorder prefs | 🟡 admin CRUD | — |
| I1–I3 تغذیه | 🟡 API | ❌ | ❌ | — |
| J1–J6 اجتماعی | 🟡 API | ❌ | ❌ | — |
| K1 فضا/سانس | ✅ class/slot + calendar | 🟡 API برای clubId واقعی + mock برای slug | ✅ CRUD/edit/cancel occurrence | — |
| K2 پرسنل + مجوز | 🟡 API staff grants | ❌ | — | — |
| K3–K8 عملیات باشگاه | 🟡 K3 assign (نقش coach الزامی) | 🟡 owner club coaches UI | 🟡 assign + audience در فرم | — |
| L1 زرین‌پال | 🟡 gateway + booking verify→ledger | 🟡 invoice UI←API | — | — |
| L2 کیف پول | 🟡 API wallet + overview | 🟡 wallet UI←API | ❌ | — |
| L3 Ledger | 🟡 API immutable | — | 🟡 admin list | — |
| L4–L8 کمیسیون/تسویه | 🟡 API payout/compensation/debt/shift | ❌ | 🟡 admin settle | — |
| M1 CRUD کاربران | ✅ | — | ✅ | — |
| M2 تأیید KYC | ✅ | — | ✅ | — |
| M3 دادهٔ مرجع | ✅ | — | ✅ | — |
| M4 تأیید UGC | 🟡 schema | — | ❌ | — |
| M5 impersonation | 🟡 schema | — | ❌ | — |
| M6 AuditLog نمایش | ✅ ثبت | — | ❌ | — |
| M7 FAQ | ✅ (`/support/faq` عمومی + CRUD ادمین) | ❌ نمایش موبایل | ✅ | ❌ نمایش سایت |
| M8–M9 اعلان/گزارش | 🟡 schema | — | ❌ | — |
| M10 تیکت پشتیبانی | ✅ (ticket + thread + resolve/close + audit) | ❌ UI موبایل (hooks آماده) | ✅ | — |
| N1 اعلان تراکنشی | ✅ dispatch (template + push + SMS fallback + FCM driver) | 🟡 پوش native نصب شد؛ نیاز به Firebase config | ❌ مدیریت قالب | — |
| N2 کاوه‌نگار | ✅ درایور | — | — | — |
| N3 inbox | ✅ (`/account/notifications` + device tokens) | ✅ صفحه اعلان‌ها متصل به API | — | — |
| N4 پیام مربی-شاگرد | 🟡 schema | ❌ | — | — |
| O1 پرداخت حضوری/ترکیبی | 🟡 API manual payment | — | ❌ | — |
| O2–O15 عملیات واقعی باشگاه | 🟡 API جزئی + OwnerTask | 🟡 home tasks badge | ❌ | — |
| P1–P12 کسب‌وکار/کیفیت مربی | 🟡 API coaching + engagement + analytics | 🟡 clients/programs/analytics UI←API | ❌ | — |
| Q1–Q12 اعتماد/سلامت ورزشکار | 🟡 Q11 audience روی Club + discovery filters | 🟡 Q2/Q3 + فیلترهای Q11 در لیست باشگاه | ❌ | 🟡 SEO جزئیات باشگاه audience |
| R1–R2 event/attribution | ✅ | ✅ کلاینت attribution | — | ❌ |
| R3–R7 lifecycle delivery | ❌ | ❌ | ❌ | — |
| R8–R9 referral reward | ❌ (invite بدون reward ✅) | ❌ | ❌ | ❌ |
| R10–R12 analytics/expansion | ❌ | ❌ | ❌ | — |

## شکاف‌های فوری فاز ۱

1. ~~اتصال `apps/mobile` به API احراز هویت~~ ✅
2. ~~UI پنل ادمین برای کاربران/KYC/basics~~ ✅
3. فعال‌سازی واقعی `SMS_PROVIDER=kavenegar` در محیط staging
4. ~~تکمیل پروفایل‌های نقش (B) روی API رانتایم + UI~~ ✅ (سطح پایه)
5. ~~ثبت attribution کلاینت~~ ✅ (پوشش event سروری جزئی؛ taxonomy کامل later)
6. تست دستی end-to-end: OTP → پروفایل → KYC → تأیید ادمین

> دیتابیس: فقط MongoDB — مهاجرت به PostgreSQL در محدوده نیست.