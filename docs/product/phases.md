# Gym4Me — فازبندی تحویل

قاعده: هر فاز فقط وقتی شروع شود که فاز قبلی end-to-end (API + UI + ادمین مربوطه) کار کند.

برنامهٔ اجرایی بستن فازها و quality gate مشترک: [`cursor-implementation-master-plan.md`](./cursor-implementation-master-plan.md).

| فاز   | نام                      | Epic ها                                                                   | خروجی قابل عرضه                                                  | وضعیت                                                                                                                 |
| ----- | ------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **۰** | زیرساخت                  | مونوریپو، UI kit، تم، i18n، schema دامنه، V1–V5 و V7                       | اسکلت پروژه + bootstrap/feature delivery امن                     | 🟡 پایهٔ پروژه انجام؛ URI `/api/v1` فعال؛ bootstrap/flags/release policy + admin UI؛ cleanup/telemetry جزئی |
| **۱** | هویت + اندازه‌گیری پایه  | A، B، N2، M1–M2، Q2–Q3، R1–R2                                             | ثبت‌نام واقعی، KYC مرحله‌ای، سوئیچ نقش، attribution و event پایه | 🟡 در حال تکمیل؛ eventهای retention متریک/ورزش/grant/health از ProgressService افزوده شد                 |
| **۲** | کاتالوگ و عرضه           | C، K1، K3، M3، M11، C5، O10، P1، P12، Q8، Q11                             | باشگاه/مربی واقعی، تأییدشده و قابل جست‌وجو                       | 🟡 discovery feed نسخه‌دار با composer ادمین و سکشن‌های مربی/کلاس/فضا/سانس/تجهیزات/پلن/رزروپذیر/امکانات، infinite scroll و targeting علایق؛ وب‌سایت و فیلتر Q11؛ K3 جزئی       |
| **۳** | رزرو و دریافت وجه        | D، L1–L3، N1، N3، O1، O5–O7، P3–P4، P6، P9، Q1، R3–R4                     | اولین تراکنش آنلاین/حضوری و حضور قابل اتکا — **هستهٔ MVP**       | 🟡 approval/TTL/idempotency/cancel preview + پرداخت ترکیبی و device check-in؛ credential واقعی Zarinpal/FCM مانده است |
| **۴** | عضویت + lifecycle        | E، F، L5، K4، O2، O8–O9، O11، O14، P2، Q5، Q12، R5–R9، R12                | فروش/مصرف/تمدید عضویت و جلوگیری از ریزش                          | 🟡 فروش و import پذیرش، پرداخت جزئی/بدهی/Ledger و lifecycle تکمیل‌تر؛ pricing عمومی؛ enforcement اشتراک جزئی          |
| **۵** | مربیگری و پیشرفت         | G، H، N4، P5، P10–P11، Q6–Q7                                              | برنامه، لاگ، متریک، self-tracking و بازخورد ایمن                 | 🟡 schema/API و UI پایه؛ health sync/goals/reminders/data-rights Wave 3؛ اجرای کامل جلسه و revision مانده |
| **۶** | مالی و عملیات مقیاس‌پذیر | L4–L8، K2، K5–K8، M5–M6، M9، O3–O4، O12–O13، O15، P7–P8، Q4، Q10، R10–R11، V6، V8 | تسویه، صندوق، پرسنل، dispute، گزارش و experimentation      | 🟡 API staff/payout/storage؛ mobile owner staff/finance؛ admin payments/payouts/refunds/audit/impersonation/analytics |
| **۷** | اجتماعی و تغذیه          | J، I، M7–M8                                                               | شبکه اجتماعی، meal plan، CMS                                     | 🟡 API social/nutrition؛ mobile feed+nutrition؛ admin food/social reports/templates                                   |

## اولویت فنی موازی در هر فاز

- پنل ادمین فقط دامنهٔ همان فاز را پوشش می‌دهد.
- اتصال کلاینت به API در همان فاز بسته می‌شود (نه UI mock جدا).
- هر قابلیت مالی از روز اول Ledger می‌نویسد.
- هر قابلیت lifecycle از event سمت سرور استفاده می‌کند و consent/frequency cap دارد.
- قابلیت‌های فاز ۷ نباید تحویل حلقهٔ «عضویت/رزرو → حضور → تمدید» را عقب بیندازند.
- نسخهٔ جدید API فقط برای breaking change ایجاد می‌شود؛ فیچرهای آماده با Feature Flag عرضه می‌شوند.
- Feature Flag و release policy قبل از rollout عمومی Self Tracking باید end-to-end و auditشده باشند.

## دروازه‌های عرضه

1. **عرضهٔ داخلی:** OTP، پروفایل نقش و admin مربوطه end-to-end.
2. **پایلوت باشگاه:** ساخت شعبه، import/ثبت عضو، عضویت حضوری و check-in.
3. **MVP درآمدی:** رزرو، پرداخت حضوری/زرین‌پال، Ledger و اعلان تراکنشی.
4. **Retention release:** تمدید، segmentهای ریسک، reminder و win-back قابل‌اندازه‌گیری.
5. **Marketplace scale:** صفحات SEO، referral و عرضهٔ کافی باشگاه/مربی در هر شهر.
