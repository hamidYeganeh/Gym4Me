# بازبینی رقبا و نقشهٔ قابلیت‌های کاربردی Gym4Me

**تاریخ تحقیق:** ۲۰۲۶-۰۸-۱۶  
**آخرین هم‌ترازی با master plan:** ۲۰۲۶-۰۸-۱۶  
**نوع سند:** پیشنهاد محصول و backlog تکمیلی؛ تصمیم قفل‌شده ایجاد نمی‌کند  
**منابع:** صفحات رسمی محصولات؛ قابلیت‌های اعلام‌شدهٔ فروشنده به‌عنوان ادعای همان محصول در نظر گرفته شده‌اند، نه اثبات کیفیت اجرا

## جمع‌بندی تصمیم

Gym4Me از نظر مسئله و دامنه محصول کاربردی است: ترکیب marketplace ورزشی، عملیات باشگاه، مربیگری و تجربه ورزشکار در بازار ایران مزیت بالقوه دارد. مشکل اصلی کمبود feature نیست؛ حلقهٔ اصلی هنوز به اندازه‌ای قابل‌اعتماد و سریع نیست که کاربر هر روز برای آن برگردد:

```text
کشف عرضهٔ واقعی → رزرو/عضویت → پرداخت → ورود → اقدام بعدی → تکرار → تمدید
```

بنابراین:

1. هیچ قابلیت P2 یا قابلیت AI نباید قبل از تکمیل P0های master plan وارد اجرا شود.
2. صفحهٔ خانهٔ هر نقش باید از ویترین قابلیت به «مرکز اقدام امروز» تبدیل شود.
3. featureهای جدید تا جای ممکن read model یا use case کوچک روی مدل‌های فعلی باشند؛ مدل و سرویس موازی ساخته نشود.
4. برندسازی باشگاه به‌صورت صفحه/تم tenant در همان محصول انجام شود، نه یک codebase یا app جدا برای هر باشگاه.
5. اتصال سخت‌افزار از adapter و contract نسخه‌دار عبور کند؛ منطق vendor داخل Booking/Membership/Check-in نرود.
6. برچسب P0 روی `G4M-MKT-*` ارزش پس از هسته است؛ وضعیت اجرایی فقط از جدول `READY`/`BLOCKED` در master plan خوانده می‌شود.

## نمونه‌های بررسی‌شده

### بازار ایران

| محصول | تمرکز و قابلیت شاخص | یادگیری مناسب Gym4Me |
|---|---|---|
| الوپلی | جست‌وجوی باشگاه/رشته/مربی، رزرو سریع، کلاس گروهی، برنامه تمرینی و غذایی | discovery فقط وقتی ارزش دارد که قیمت، ظرفیت و رزرو واقعی تا پرداخت ادامه یابد |
| پاکوب | ثبت‌نام و پرداخت، ظرفیت، اعضا، نقش مدیر/حسابدار/سرپرست، کیف پول، اعلان و گزارش | workflow نقش‌محور و عملیات سادهٔ روزانه از تعداد زیاد منو مهم‌تر است |
| ایران‌بدن | برنامه تمرینی و غذایی و پیگیری پیشرفت برای باشگاه/مربی | ابزار مربی باید به adherence و feedback واقعی ختم شود |
| سلامت / اتوماسیون‌های باشگاهی | عضو، شهریه، حضور، مالی و گزارش | member بدون اپ و front desk سریع برای بازار ایران ضروری است |
| تایگرتکو و راهکارهای کنترل تردد | رزرو، تمدید، حضور و اتصال کارت/اثر انگشت/گیت/کمد | integration سخت‌افزار مزیت B2B است، ولی باید پس از check-in آنلاین پایدار و از طریق adapter عرضه شود |

منابع رسمی: [الوپلی](https://aloplay.io/fa)، [پاکوب](https://pakoobapp.ir/)، [ایران‌بدن](https://www.iranbadan.com/)، [سلامت](https://salamat-soft.ir/)، [تایگرتکو](https://tigerteco.com/club-automation).

### بازار خارجی

| محصول | تمرکز و قابلیت شاخص | یادگیری مناسب Gym4Me |
|---|---|---|
| Mindbody | marketplace + booking، پرداخت، membership، waitlist، check-in، automation و CRM | اتصال journey و بازیابی ظرفیت لغوشده ارزش بالاتری از social مستقل دارد |
| ABC Glofox | رزرو، billing/renewal، check-in/kiosk/access، churn alert و member self-service | خانه مالک باید exception و ریسک را نشان دهد، نه فقط اعداد تزئینی |
| ABC Trainerize | workout/nutrition/habit، compliance، پیام/voice، calendar sync و risk tags | مربی باید بداند «کدام شاگرد نیاز به اقدام دارد»؛ feed عمومی اولویت پایین‌تری دارد |
| Virtuagym | gym ops + coaching + progress/wearables + community/challenges | قابلیت engagement باید به حضور، adherence و تمدید قابل‌اندازه‌گیری متصل باشد |
| ClassPass | عرضهٔ چندباشگاهی و جذب کاربر جدید برای ظرفیت قابل‌فروش | marketplace نباید مالکیت رابطه باشگاه با عضو را مبهم یا pricing را غیرشفاف کند |

منابع رسمی: [Mindbody Fitness](https://www.mindbodyonline.com/business/fitness)، [Mindbody pricing/features](https://www.mindbodyonline.com/business/pricing)، [ABC Glofox](https://www.glofox.com/business-types/gym-management-software/)، [ABC Trainerize](https://www.trainerize.com/features/)، [Virtuagym](https://business.virtuagym.com/gym-software/)، [ClassPass for gyms](https://classpass.com/partners/gym-business).

## ارزیابی کاربردی بودن نسخهٔ فعلی

### نقاط قوی واقعی

- چهار نقش و `activeRole` با grant پرسنل با مسئلهٔ بازار سازگارند.
- مدل‌های Booking، Waitlist، Membership، Check-in، Ledger، Notification، Lifecycle، Coach Lead و Progress پایهٔ دامنهٔ مناسبی می‌سازند.
- موبایل، پنل ادمین، وب عمومی و API در یک monorepo امکان vertical slice و reuse قرارداد را می‌دهند.
- ترکیب marketplace با club operations می‌تواند Gym4Me را از نرم‌افزار صرفاً داخلی باشگاه یا اپ صرفاً تمرینی متمایز کند.

### چرا هنوز استفادهٔ روزانه ضعیف می‌شود

- خانه ورزشکار مقدار تمرین، قدم و زمان فعال ثابت نمایش می‌دهد و به رزرو/عضویت/دادهٔ واقعی امروز متصل نیست.
- خانه مالک فقط شمار تسک را از API می‌گیرد؛ آمار، باشگاه‌ها و بیشتر متن وظایف نمونه‌ای‌اند.
- خانه مربی shortcut دارد، اما session بعدی، شاگرد پرریسک، feedback معوق و درآمد قابل‌اقدام را نشان نمی‌دهد.
- discovery و اعلان در چند مسیر empty/error را با mock پر می‌کنند؛ کاربر نمی‌تواند واقعی بودن ظرفیت یا پیام را تشخیص دهد.
- breadth زیاد است، اما اطمینان رزرو/پرداخت/check-in، تست و providerهای واقعی هنوز release-ready نیستند.

نتیجه: محصول از نظر value proposition مفید است، اما در وضعیت فعلی بیشتر «دموی گستردهٔ یک پلتفرم کامل» است تا ابزار قابل‌اتکای روزانه. تکمیل هسته، نه اضافه‌کردن منو، بیشترین افزایش کاربرد را ایجاد می‌کند.

## قابلیت‌های پیشنهادی و تطبیق معماری

| ID | قابلیت و ارزش | اولویت | وضعیت فعلی | محل معماری / مدل | وابستگی اجرایی |
|---|---|---:|---|---|---|
| MKT-01 | **مرکز اقدام امروز برای هر نقش**: رزرو/تمرین و QR بعدی برای ورزشکار؛ session و شاگرد نیازمند پیگیری برای مربی؛ بدهی، صف پذیرش، ظرفیت و ریسک تمدید برای مالک | P0 | UI خانه وجود دارد ولی عمدتاً static | query/read-model در دامنه‌های موجود؛ mobile screen فقط view state | G4M-020, 021, 030, 050 |
| MKT-02 | **رزرو مجدد و تمدید یک‌لمسی** با preview مبلغ/قانون و idempotency | P0 | مسیرهای پایه موجود، shortcut lifecycle کامل نیست | Booking command + Membership command + Pricing snapshot + Ledger/Outbox | G4M-030, 031, 040, 050 |
| MKT-03 | **صف انتظار خودکار و ضد no-show**: reminder، لغو یک‌لمسی، offer زمان‌دار و refill ظرفیت | P0 | Waitlist schema/service وجود دارد؛ journey کامل نیاز به سخت‌سازی دارد | Waitlist/Booking state machine + Notification Outbox + worker lease | G4M-030, 040 |
| MKT-04 | **پاس دیجیتال و پذیرش سریع**: QR عضویت، جست‌وجوی عضو بدون اپ، فروش/تمدید/check-in زیر ۳۰ ثانیه | P0 | اجزای عضویت/check-in/desk sale موجود اما کامل نیست | Membership + Check-in + Finance؛ بدون مدل موازی | G4M-031, 050, 051 |
| MKT-05 | **لغو/جابجایی شفاف**: نمایش مهلت، جریمه، refund/credit و نتیجه قبل از تأیید | P0 | رفتار پراکنده | Booking policy query + pricing/refund command؛ Ledger reversal | G4M-030, 031 |
| MKT-06 | **تقویم و لینک قابل‌اشتراک**: افزودن session به Apple/Google/ICS و deep link کلاس/مربی/باشگاه | P1 | کامل نیست | projection از Booking/Slot؛ website/mobile route؛ token عمومی بدون PII | پس از G4M-021, 030؛ **جدا از G4M-MKT-02** |
| MKT-07 | **trial/guest pass و تبدیل به عضو** با attribution و follow-up | P1 | lead/referral/عضویت پایه وجود دارد | CoachLead/Lifecycle/Referral + Membership offer؛ Ledger فقط در پرداخت | پس از G4M-031, 050 |
| MKT-08 | **عضویت خانوادگی/کودک و corporate credit** با guardian/consent و سقف مصرف | P1 | در نیازمندی‌ها آمده، vertical slice کامل نیست | Membership relation + Consent + Wallet/Ledger؛ platform membership جدا از club membership | پس از G4M-050 و G4M-012 |
| MKT-09 | **ظرفیت و شلوغی قابل‌اعتماد**: ظرفیت لحظه‌ای سانس و heatmap تاریخی ناشناس؛ نه ادعای live بدون داده | P1 | occupancy schema هست، UI قابل اتکا نیست | ClubSlotOccupancy + Check-in projection؛ aggregate بدون PII | پس از G4M-030, 051 |
| MKT-10 | **صف پیگیری مربی**: compliance پایین، برنامه/feedback معوق، جلسه بعدی و weekly summary | P1 | داده‌های coaching/progress وجود دارد؛ home عملیاتی نیست | Coaching/Progress query read model؛ grant در query-time | پس از G4M-060 |
| MKT-11 | **بازخورد سریع مربی** با voice/short media روی session/program، نه chat عمومی بدون context | P1 | message/media ناقص | Coaching message + Media ownership/scan + Notification | G4M-060, 061 |
| MKT-12 | **ریسک ریزش و win-back قابل توضیح**: rule-based signal و CTA، با opt-out | P1 | Lifecycle پایه وجود دارد | Lifecycle projector + Notification preferences؛ ابتدا rule-based | پس از G4M-040, 050 |
| MKT-13 | **صفحه عمومی/تم باشگاه** در همان اپ و وب، با shareable booking widget | P2 | پروفایل عمومی/website پایه هست | tenant theme/config + public projection؛ بدون app fork | پس از G4M-070 |
| MKT-14 | **adapter تجهیزات** برای barcode/RFID/gate/kiosk/locker با certification هر vendor | P2 | check-in device پایه وجود دارد | `checkin/infrastructure/adapters` + signed device command + audit | پس از G4M-051, 070؛ ADR فقط در صورت broker جدید |
| MKT-15 | **گواهی دوره/رویداد** با verification URL و PDF | P2 | قابلیت عمومی نیست | Completion read model + media/PDF adapter؛ بدون تغییر Ledger | پس از هسته؛ فقط برای verticalهای نیازمند دوره |

## قابلیت‌هایی که فعلاً نباید ساخته شوند

- AI خودمختار برای نسخه تمرینی/تغذیه‌ای یا تصمیم سلامت؛ ریسک، نبود دادهٔ معتبر و ارزش کمتر از هسته.
- dynamic pricing غیرشفاف شبیه marketplaceهای credit-based؛ با اعتماد و شفافیت قیمت در بازار هدف تعارض دارد. تخفیف ظرفیت خالی فقط با opt-in باشگاه، بازه قیمت روشن و pricing snapshot قابل audit بررسی شود.
- اپ جدا و codebase جدا برای هر باشگاه؛ هزینه نگهداری و release را چندبرابر می‌کند.
- feed اجتماعی پیشرفته، leaderboard عمومی یا gamification گسترده پیش از اثبات اثر روی حضور و تمدید.
- اتصال مستقیم vendor سخت‌افزار به domain service یا ذخیره biometric template در Gym4Me.

## backlog اجرایی تکمیلی برای Cursor

### G4M-MKT-01 — Role Action Center واقعی

- **Priority/status:** P0 پس از هسته / BLOCKED by G4M-020, G4M-021, G4M-030, G4M-050.
- **Persona/value:** ATH/CCH/OWN؛ پاسخ به مهم‌ترین سؤال امروز با حداکثر سه اقدام اصلی.
- **Scope:** read modelهای role-specific، قرارداد `@repo/api`، gate و home screen موبایل، analytics حداقلی.
- **کار:** ابتدا inventory دادهٔ واقعی هر role؛ query projection با محدودیت؛ stateهای loading/empty/error/stale؛ حذف اعداد و statusهای ثابت؛ CTA فقط به use case موجود و مجاز.
- **پذیرش:** خانه athlete رزرو/تمرین/اعتبار واقعی بعدی، coach جلسه/پیگیری واقعی و owner exceptionهای واقعی را نشان دهد؛ قطع API fixture نمایش ندهد؛ پاسخ query با p95 هدف‌گذاری‌شده در محیط staging ثبت شود.
- **یادداشت وابستگی:** CTAهای booking/membership می‌توانند روی دادهٔ همان دامنه‌ها سوار شوند؛ `G4M-021` برای جلوگیری از deep-link به قیمت/ظرفیت discovery ناپایدار الزامی است، نه برای ساخت dashboard جدا.
- **عدم انجام:** recommendation ML، redesign سراسری یا ایجاد dashboard service چنددامنه‌ای بزرگ.

### G4M-MKT-02 — Recovery loop رزرو و ظرفیت

- **Priority/status:** P0 پس از هسته / BLOCKED by G4M-030, G4M-031, G4M-040.
- **Persona/value:** ATH/OWN؛ کاهش no-show و جای خالی بدون کار دستی.
- **Scope:** reminder، cancel/reschedule preview، waitlist offer زمان‌دار، one-tap claim، refill ظرفیت.
- **خارج از محدوده:** calendar export / ICS / deep link اشتراکی — آن‌ها قابلیت محصولی **MKT-06** هستند و پس از `G4M-021` + `G4M-030` جداگانه اولویت‌بندی می‌شوند؛ داخل این تسک پیاده نشوند.
- **مرز با هسته:** state machine رزرو/waitlist و idempotency در `G4M-030/040` بسته می‌شود؛ این تسک journey بازیابی و UX یک‌لمسی روی همان مدل‌هاست.
- **پذیرش:** لغو واجدشرایط یک offer زمان‌دار می‌سازد؛ دو claim هم‌زمان فقط یک برنده دارند؛ expiry ظرفیت را آزاد می‌کند؛ اعلان تکراری و Ledger تکراری ساخته نمی‌شود؛ policy پیش از تأیید به کاربر نمایش داده می‌شود.
- **edge:** silent notification، timezone، offer منقضی، refund pending، ظرفیت آخر، worker retry.

### G4M-MKT-03 — Trial، family و corporate membership

- **Priority/status:** P1 / BLOCKED by G4M-012, G4M-031, G4M-050.
- **Persona/value:** OWN/ATH؛ جذب کم‌اصطکاک و پوشش خرید خانوادگی/سازمانی.
- **Scope:** trial offer نسخه‌دار، guest claim، guardian consent، sponsor/corporate credit و conversion attribution.
- **پذیرش:** guest پس از ساخت حساب duplicate نشود؛ guardian فقط scope مجاز را ببیند؛ credit مصرف‌شده با Ledger تطبیق یابد؛ عضویت پلتفرم و باشگاه ادغام نشوند.

### G4M-MKT-04 — Occupancy guidance و front-desk fast mode

- **Priority/status:** P1 / BLOCKED by G4M-050, G4M-051.
- **Persona/value:** ATH/STF/OWN؛ انتخاب زمان بهتر و پذیرش سریع‌تر.
- **Scope:** projection ظرفیت، heatmap تاریخی، queue پذیرش، scan/search/sell/renew/check-in.
- **مرز با هسته:** فروش/check-in پایه در `G4M-050/051`؛ این تسک تمایز ظرفیت رزرو vs check-in vs تخمین تاریخی و مسیر usability زیر ۳۰ ثانیه است.
- **پذیرش:** UI بین ظرفیت رزرو، شمار check-in و تخمین تاریخی تمایز روشن بگذارد؛ هیچ PII در aggregate نباشد؛ مسیر استاندارد پذیرش عضو موجود در تست usability داخلی کمتر از ۳۰ ثانیه انجام شود.

### G4M-MKT-05 — Coach Follow-up Queue

- **Priority/status:** P1 / BLOCKED by G4M-060, G4M-061.
- **Persona/value:** CCH/ATH؛ تمرکز مربی روی شاگردی که به کمک نیاز دارد.
- **Scope:** ruleهای explainable، weekly summary، feedback مرتبط با session/program و voice attachment.
- **پذیرش:** هر signal دلیل و CTA دارد؛ قطع relationship/grant فوراً داده را پنهان می‌کند؛ media private و signed است؛ پیام خودکار opt-out و quiet-hours را رعایت می‌کند.

### G4M-MKT-06 — Public club surface و hardware adapter pilot

- **Priority/status:** P2 / BLOCKED by G4M-051, G4M-070 و تصویب pilot تجاری.
- **Scope:** theme/page/widget در همان deployment؛ یک contract vendor-neutral و فقط یک pilot سخت‌افزاری.
- **پذیرش:** هیچ fork اپ/DB ایجاد نشود؛ device revoke و replay protection تست شود؛ داده biometric خام دریافت یا ذخیره نشود؛ vendor outage check-in اصلی را از کار نیندازد.

## ترتیب اجرا

```text
P0های master plan (ترتیب ترجیحی پس از G4M-002 در master plan)
  → G4M-MKT-01 و G4M-MKT-02
  → اثبات KPI حلقه اصلی (جدول زیر)
  → G4M-MKT-03 / 04 / 05
  → فقط پس از اثبات تقاضای تجاری: G4M-MKT-06
```

### KPIهای تصمیم‌گیری قبل از شروع موج MKT-03+

آستانه‌ها برای staging یا cohort محدود اندازه‌گیری می‌شوند؛ بدون baseline ثبت‌شده، «اثبات» قبول نیست. منبع event باید correlation/idempotency key داشته باشد و PII نداشته باشد. اندازه‌گیری اولیه می‌تواند هم‌زمان با rollout محدود `G4M-MKT-01/02` شروع شود؛ دروازهٔ سخت برای گسترش به `MKT-03+` است.

| KPI | منبع event / داده | آستانهٔ اثبات (حداقل) | دروازه |
|---|---|---|---|
| تکمیل discovery→booking | `discovery_view` → `booking_created` | ≥ پایهٔ دو هفتهٔ اول + بهبود نسبی قابل تکرار در هفتهٔ سوم | قبل از MKT-03 |
| موفقیت پرداخت | `payment_verify_succeeded` / attempts | ≥ ۹۵٪ verify موفق روی تراکنش‌های غیر timeout؛ reconcile صفر اختلاف باز >24h | قبل از MKT-03 |
| زمان check-in استاندارد | desk/check-in telemetry یا تست usability | میانهٔ مسیر عضو موجود < ۳۰ ثانیه در تست داخلی | قبل از MKT-04 |
| نرخ no-show | booking status `NO_SHOW` / confirmed | کاهش نسبت به baseline پس از reminder+cancel آسان | قبل از گسترش MKT-02 به همه باشگاه‌ها |
| refill صف انتظار | `waitlist_offer_claimed` / cancelled capacity | ≥ یک claim موفق به‌ازای هر N لغو واجدشرایط در staging | قبل از MKT-03 |
| repeat booking ۳۰روزه | bookings per athlete در ۳۰ روز | روند صعودی نسبت به baseline cohort | قبل از MKT-05 گسترده |
| renewal عضویت | membership renew events / eligible | روند صعودی یا churn کاهش‌یافته نسبت به baseline | قبل از MKT-06 |
| پاسخ به شاگرد پرریسک | coach follow-up CTA completed / surfaced | ≥ نیمی از signalهای surfaced در هفته پاسخ فعال بگیرند | قبل از تعمیم MKT-05 |

## اثر بر تصمیمات قفل‌شده

- هیچ پیشنهاد P0/P1 نیازمند تغییر stack یا خروج از modular monolith نیست.
- Mongo transaction + Ledger + Outbox برای mutationهای مالی/ظرفیت حفظ می‌شود.
- health و coaching data خصوصی و grant-scoped باقی می‌ماند.
- `activeRole` و staff permission grant منبع مجوزند؛ feature flag مجوز نیست.
- فقط ورود broker جدید، ذخیره داده biometric، مدل قیمت‌گذاری marketplace یا app fork برای tenant نیازمند ADR/تصمیم جدید است و فعلاً پیشنهاد نشده است.
