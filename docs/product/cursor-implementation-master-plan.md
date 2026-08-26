# Gym4Me — برنامهٔ اجرایی تکمیل محصول برای Cursor

آخرین بازبینی: ۲۰۲۶-۰۸-۲۳ (ایزوله‌سازی کامل دادهٔ demo از production mobile)

این سند backlog اجرایی مرجع برای رساندن Gym4Me از وضعیت فعلی به محصول قابل‌عرضه، قابل‌پشتیبانی و توسعه‌پذیر است. وضعیت واقعی قابلیت‌ها همچنان در [`checklist.md`](./checklist.md) ثبت می‌شود و تصمیمات قفل‌شدهٔ [`decisions.md`](./decisions.md) بر این سند اولویت دارند.

قابلیت‌های حاصل از بررسی بازار داخلی و خارجی در [`competitive-product-review-2026-08.md`](./competitive-product-review-2026-08.md) به‌صورت `G4M-MKT-01..06` تسک شده‌اند. Cursor فقط پس از بازشدن وابستگی‌های همان تسک و طبق ترتیب master plan مجاز به شروع آن‌هاست؛ این backlog جای P0های هسته را نمی‌گیرد.

**برچسب اولویت vs وضعیت:** `P0` روی `G4M-MKT-*` یعنی ارزش محصول بالا پس از هسته است، نه اینکه هم‌اکنون `READY` باشند. تنها تسک قابل شروع همان اولین ردیف با وضعیت `READY` و وابستگی‌های `DONE` است.

## هدف نهایی

خروجی این برنامه باید یک vertical slice کامل برای این حلقه باشد:

```text
کشف واقعی → رزرو/عضویت → پرداخت → حضور → استفادهٔ تکراری → تمدید
```

«کامل» یعنی API، `@repo/api`، موبایل/ادمین/وب مرتبط، مسیرهای failure/retry، مجوز، audit، telemetry و تست end-to-end هم‌زمان بسته باشند. وجود schema، endpoint تنها یا UI متصل به mock تکمیل محسوب نمی‌شود.

## پروتکل اجباری اجرای Cursor

1. فقط اولین تسک `READY` که همهٔ وابستگی‌هایش `DONE` است انتخاب شود. اگر چند تسک هم‌زمان READY شدند، ترتیب ترجیحی پس از `G4M-002` در همین سند اولویت دارد.
2. پیش از تغییر، `git status --short` و diff فایل‌های درگیر خوانده شود؛ تغییرات موجود کاربر حذف یا بازنویسی نشوند.
3. یک تسک در هر PR/commit انجام شود. refactor نامرتبط یا dependency جدید وارد همان تغییر نشود.
4. قبل از کدنویسی، تصمیمات قفل‌شده و ruleهای `.cursor/rules` خوانده شوند.
5. ترتیب هر vertical slice: قرارداد/مدل → API → `@repo/api` → UI مصرف‌کننده → admin/website لازم → تست → docs.
6. هر mutation مالی، ظرفیت، reward یا notification باید idempotent باشد. هر تغییر مالی باید Ledger غیرقابل‌ویرایش بنویسد.
7. mock فقط در demo mode صریح مجاز است؛ خطا یا empty response در production نباید دادهٔ ساختگی نمایش دهد.
8. status تسک فقط وقتی `DONE` می‌شود که تمام معیارهای پذیرش و quality gate آن پاس شده باشند.
9. پس از هر تسک، `checklist.md`، سناریوی مرتبط و این سند به‌روز شوند. ادعای تکمیل بدون evidence تست ممنوع است.
10. اگر نیاز جدید با `decisions.md` تعارض دارد، پیاده‌سازی متوقف و ADR/تصمیم جدید درخواست شود.

### دستور شروع آماده برای Cursor

```text
تسک G4M-002 را از docs/product/cursor-implementation-master-plan.md اجرا کن.
قبل از تغییر، ruleهای .cursor و تغییرات موجود کاربر را بخوان.
فقط scope همین تسک را پیاده‌سازی کن، همه معیارهای پذیرش و quality gateها را اجرا کن
و تا قبل از پاس‌شدن کامل، وضعیت تسک را DONE نکن.
```

## وضعیت‌ها

- `BLOCKED`: حداقل یک وابستگی انجام‌نشده یا تصمیم بیرونی دارد.
- `READY`: قابل شروع است.
- `IN_PROGRESS`: فقط یک تسک در هر شاخه.
- `VERIFY`: پیاده‌سازی شده، اما همهٔ gateها پاس نشده‌اند.
- `DONE`: معیار پذیرش، تست و مستندات کامل‌اند.

## Definition of Done مشترک

هر تسک علاوه بر معیارهای اختصاصی باید موارد زیر را پاس کند:

- authorization با `activeRole` و برای staff با permission grant در API تست شده باشد.
- loading، empty، error، retry و offline متناسب با قابلیت طراحی شده باشد.
- متن‌های کاربر در `@repo/i18n` باشند؛ RTL، تقویم شمسی، شنبه‌محور و timezone ایران بررسی شوند.

> راستی‌آزمایی محلی ۲۰۲۶-۰۸-۲۶: parser تاریخ جلالی اکنون ارقام فارسی/عربی را normalize، تاریخ نامعتبر اسفند/ماه را با round-trip رد و `Date` را بر مبنای `Asia/Tehran` به روز مدنی تبدیل می‌کند؛ تست‌های Nowruz، leap day و مرز UTC→Tehran در `apps/mobile/src/shared/lib/jalali.test.ts` و `apps/mobile/src/shared/components/JalaliCalendar/jalali-calendar-utils.test.ts` سبزند. certification تصویری/صفحه‌خوان دستگاه همچنان جداست.
- داده حساس، OTP، token و payload سلامت در log/analytics ثبت نشود.
- index، idempotency، race condition و rollback/recovery برای mutation بررسی شوند.
- eventهای موفقیت و شکست با correlation/idempotency key ثبت شوند.
- `npm run check-types`، `npm run lint`، unit/integration مرتبط و build اپ‌های درگیر پاس شوند.
- contract `@repo/api` و OpenAPI با API واقعی هم‌خوان باشند.
- فایل جدید بزرگ و چندمسئولیتی ایجاد نشود؛ guardrailهای معماری در [`architecture-completion-guardrails.md`](./architecture-completion-guardrails.md) رعایت شوند.

## نقشهٔ وابستگی

```text
G4M-001 → G4M-002 → G4M-003
                    ├─ G4M-020 → G4M-021 ─┐
                    ├─ G4M-030 → G4M-031 ─┼→ G4M-050 → G4M-051 ─┐
                    └─ G4M-040 ────────────┘                     │
G4M-002 → G4M-010 ┬→ G4M-011 ─┐                                ├→ G4M-060 → G4M-061 ─┐
                  └→ G4M-012 ─┴→ G4M-013 ────────────────────────┘                    ├→ G4M-070
تمام P0ها ─────────────────────────────────────────────────────────────────────────────┘
```

### ترتیب ترجیحی پس از G4M-002 (تیم کوچک / مسیر درآمد)

وقتی چند تسک هم‌زمان `READY` می‌شوند، به‌جای انتخاب تصادفی از جدول، این ترتیب را رعایت کن مگر تصمیم محصول خلاف آن بگوید:

```text
1) G4M-003  → مرز تراکنش و آماده‌سازی رزرو/پرداخت
2) G4M-020  → حذف mock از production (اعتماد کاربر؛ موازی کوتاه با 003 فقط اگر ظرفیت دو PR باشد)
3) G4M-030 → G4M-040 → G4M-031  → هستهٔ ظرفیت و پول
4) G4M-021 → G4M-050 → G4M-051  → discovery واقعی + عضویت + check-in
5) شاخهٔ Health (G4M-010…) فقط وقتی مسیر درآمد بالا در VERIFY/DONE است یا ریسک compliance فوری دارد
6) G4M-MKT-01 / 02 فقط بعد از بازشدن deps؛ تقویم/ICS خارج از MKT-02 و در MKT-06 محصولی است
```

**مرز هسته vs MKT:** حداقل رزرو اتمیک، waitlist state machine، cancel/policy preview، desk sale و check-in در `G4M-030/031/040/050/051` بسته می‌شوند. `G4M-MKT-02` لایهٔ recovery محصولی (offer زمان‌دار، one-tap claim، ضد no-show end-to-end) است نه تکرار همان mutationها. `G4M-MKT-04` usability/heatmap روی پذیرش است نه جایگزینی desk sale هسته.

## خلاصهٔ backlog

| ID         | اولویت | وضعیت       | عنوان                                                 | وابستگی                      |
| ---------- | ------ | ----------- | ----------------------------------------------------- | ---------------------------- |
| G4M-001    | P0     | DONE        | برگرداندن quality gate و build پایدار                 | —                            |
| G4M-002    | P0     | DONE        | CI کامل، test pyramid و محیط integration              | G4M-001                      |
| G4M-003    | P0     | DONE        | شکستن God Serviceها و تعریف transaction boundary      | G4M-002                      |
| G4M-010    | P0     | VERIFY      | اصلاح permission و failure semantics در Health Sync   | G4M-002                      |
| G4M-011    | P0     | BLOCKED     | incremental Health Sync، cursor و offline queue واقعی | G4M-010                      |
| G4M-012    | P1     | BLOCKED     | حقوق داده و حذف حساب با retention روشن                | G4M-010                      |
| G4M-013    | P1     | BLOCKED     | observability و امنیت دادهٔ سلامت                     | G4M-011, G4M-012             |
| G4M-020    | P0     | DONE        | حذف mock از مسیرهای production و demo isolation       | G4M-002                      |
| G4M-021    | P0     | VERIFY      | discovery واقعی کامل و supply integrity               | G4M-020                      |
| G4M-030    | P0     | DONE        | رزرو اتمیک، ظرفیت و idempotency سراسری                | G4M-003                      |
| G4M-031    | P0     | VERIFY      | پرداخت، coupon، wallet، refund و reconciliation واقعی | G4M-030                      |
| G4M-040    | P0     | DONE        | workerهای چند-instance و outbox قابل اتکا             | G4M-003                      |
| G4M-050    | P0     | BLOCKED     | عضویت، subscription enforcement و عملیات پذیرش        | G4M-021, G4M-031, G4M-040    |
| G4M-051    | P0     | BLOCKED     | check-in آفلاین امن و reconciliation؛ slice محلی `PARTIAL` | G4M-050                      |
| G4M-060    | P1     | BLOCKED     | مربیگری و اجرای تمرین end-to-end                      | G4M-013, G4M-051             |
| G4M-061    | P1     | BLOCKED     | رسانه، اجتماعی و تغذیه بدون placeholder               | G4M-060                      |
| G4M-070    | P1     | BLOCKED     | تکمیل ادمین، وب‌سایت و certification نهایی            | G4M-013, G4M-061 و همهٔ P0ها |
| G4M-MKT-01 | P0*    | BLOCKED     | Role Action Center واقعی (*پس از هسته)                | G4M-020, 021, 030, 050       |
| G4M-MKT-02 | P0*    | BLOCKED     | Recovery loop رزرو و ظرفیت (*پس از هسته؛ بدون ICS)    | G4M-030, 031, 040            |
| G4M-MKT-03 | P1     | BLOCKED     | Trial، family و corporate membership                  | G4M-012, 031, 050            |
| G4M-MKT-04 | P1     | BLOCKED     | Occupancy guidance و front-desk fast mode             | G4M-050, 051                 |
| G4M-MKT-05 | P1     | BLOCKED     | Coach Follow-up Queue                                 | G4M-060, 061                 |
| G4M-MKT-06 | P2     | BLOCKED     | Public club surface و hardware adapter pilot          | G4M-051, 070، تصویب pilot    |

جزئیات پذیرش، مرز هسته، KPI و خارج‌ازمحدودهٔ تقویم برای `G4M-MKT-*` در [`competitive-product-review-2026-08.md`](./competitive-product-review-2026-08.md) است؛ این جدول فقط وضعیت اجرایی را نگه می‌دارد.

> پیشرفت محلی G4M-MKT-02 در ۲۰۲۶-۰۸-۲۶: refill خودکار FIFO پس از لغو، Outbox/SMS زمان‌دار و claim اتمیک تا Booking/payment hold با replay idempotent و اتصال mobile بسته شد. race دو claim روی API/Mongo replica-set/Redis واقعی نیز با یک Booking مشترک و `reserved=1` در `apps/api/test/waitlist-claim-concurrency.cjs` پاس شد؛ mobile برای silent notification روی foreground/reconnect/expiry refresh می‌کند. وضعیت طبق قواعد dependency تغییر نکرده است؛ KPI و exposure/error monitoring در staging هنوز مانده‌اند.

> پیشرفت محلی coaching در ۲۰۲۶-۰۸-۲۶: مسیر Coach Leads از schema/controller تا `@repo/api` و mobile واقعی متصل شد؛ list/create/stage دارای loading/error/retry، فرم RHF/Zod و ایجاد idempotent با fingerprint payload است (`apps/api/src/schemas/coach-lead.schema.ts`, `apps/api/src/account/coaching/coaching.service.ts`, `packages/api/src/coaching/`, `apps/mobile/src/modules/coach/lib/CoachLeadsGate.tsx`). unit/client/type checks پاس‌اند. سناریوی integration آمادهٔ اجرا در `apps/api/test/coach-leads-scenario.cjs` است، اما در این نشست شروع API محلی توسط مجوز محیط رد شد؛ بنابراین integration هنوز بسته ادعا نمی‌شود. این slice فقط pipeline لید است و weekly follow-up queue در `G4M-MKT-05` را کامل نمی‌کند.

> پیشرفت محلی follow-up در ۲۰۲۶-۰۸-۲۶: Action Center مربی اکنون شمار همهٔ رابطه‌های فعال `AT_RISK` را server-side محاسبه و CTA را به صف فیلترشدهٔ `/coach/clients?engagement=at-risk` هدایت می‌کند؛ صفحه نیز همان فیلتر را به API bounded می‌فرستد و دیگر خطای production را به empty state تبدیل نمی‌کند. unauthorized، error و retry مستقل‌اند. query شاگردان فقط projection محدود نام و avatar حساب مرتبط را برمی‌گرداند تا UI به‌جای بخشی از ObjectId، هویت قابل‌فهم نشان دهد. صف فیلترشده اکنون خلاصهٔ تعداد پیگیری و CTA مستقیم برای open/get thread واقعی دارد؛ شکست پیام، عملیات را به موفقیت جعلی تبدیل نمی‌کند و صفحهٔ جزئیات نیز همان projection واقعی نام/avatar را مصرف می‌کند (`apps/api/src/account/coaching/application/queries/coaching-students.query.ts`, `packages/api/src/coaching/coaching.dto.ts`, `apps/mobile/src/modules/coach/lib/CoachClientsGate.tsx`, `apps/mobile/src/modules/coach/lib/CoachClientDetailGate.tsx`). تست Action Center `6/6`، projection `1/1` و type-check API/shared/mobile پاس شد. feedback تمرین append-only در G4M-060 موجود است؛ voice attachment همچنان خارج از این slice است.

> سخت‌سازی mobile در ۲۰۲۶-۰۸-۲۶: callbackهای transport برای 401 و KYC دیگر `window.location.assign` و reload کامل WebView انجام نمی‌دهند؛ یک bridge محدود به مسیر داخلی، navigation را با App Router اجرا و session منقضی را هم‌زمان در AuthProvider باطل می‌کند (`apps/mobile/src/shared/lib/api-client.ts`, `apps/mobile/src/shared/providers/ApiNavigationBridge.tsx`, `apps/mobile/src/shared/providers/AuthProvider.tsx`). تمام importهای بلااستفادهٔ باقی‌مانده از مهاجرت header بر اساس ESLint حذف شد؛ mobile lint اکنون صفر warning/error، type-check سبز و production static export هر ۱۹۵ صفحه با exit code صفر است. اجرای کامل unit/contract نیز سبز است: API `295/295`، mobile `105/105`، shared API `25/25`، admin `2/2` و website `6/6`. این شواهد جای certification دستگاه فیزیکی/accessibility را نمی‌گیرد.

> certification build محلی ۲۰۲۶-۰۸-۲۶: `turbo run build` هر چهار خروجی API/admin/website/mobile را بدون cache و با `4/4` موفق ساخت؛ website شامل ۲۱ صفحهٔ static/dynamic و mobile شامل ۱۹۵ route static/SSG است. artifact audit متن انگلیسی 404 پیش‌فرض Next را پیدا کرد؛ صفحهٔ semantic فارسی با heading، recovery link و focus-visible برای mobile و website اضافه و namespace آن در bundle محدود website ثبت شد (`apps/mobile/src/app/not-found.tsx`, `apps/website/src/app/not-found.tsx`, `apps/website/src/i18n/request.ts`). build مجدد website و clean build mobile هر دو exit code صفر داشتند. cache ناقص `.next/dev/types` ناشی از buildهای هم‌زمان به `/private/tmp/gym4me-mobile-next-stale-20260826-1121` منتقل شد و در clean build تکرار نشد؛ source یا dependency تغییر داده نشد.

> security dependency audit در ۲۰۲۶-۰۸-۲۶: اجرای فقط‌خواندنی `npm audit --omit=dev` روی registry رسمی ۴ finding با severity high گزارش کرد: `@nestjs/swagger@11.4.6 → js-yaml@5.2.1`، `nanoid@3.3.16` و مسیرهای `postcss` (ریشهٔ Next روی `8.5.23` و مسیر `sanitize-html@2.17.6 → postcss@8.4.31`). Swagger در production پیش‌فرض خاموش است و codebase مستقیماً `js-yaml/nanoid/postcss` را فراخوانی نمی‌کند؛ بااین‌حال finding رفع‌شده محسوب نمی‌شود. برای کاهش سطح حمله بدون تغییر dependency، پشتیبانی CSS دلخواه از `span` مقاله حذف و smoke test با dependency واقعی Node برای script/event/style/scheme ناامن افزوده شد (`apps/api/src/common/utils/html-sanitize.util.ts`, `apps/api/src/common/utils/html-sanitize.util.spec.ts`). طبق منع صریح install/upgrade، dependency یا lockfile تغییر نکرد؛ remediation و audit مجدد گیت release است. ADR پیشنهادی family/corporate/trial نیز در `docs/product/adr/0002-family-corporate-trial-memberships.md` ثبت شد و تا تأیید صریح `PROPOSED` می‌ماند.

> سخت‌سازی auth در ۲۰۲۶-۰۸-۲۶: rotation قبلی refresh token یک read→create→revoke غیراتمیک داشت و دو درخواست هم‌زمان می‌توانستند هر دو token جدید بسازند. rotation اکنون token قبلی را با predicate `revokedAt=null` و expiry معتبر در Mongo transaction claim می‌کند، replacement را در همان transaction می‌سازد و reuse را فقط برای token واقعاً revoked تشخیص می‌دهد؛ reuse کل همان `sessionId` را revoke می‌کند و session دستگاه‌های دیگر را نمی‌بندد. unknown/expired token به‌اشتباه reuse محسوب نمی‌شود (`apps/api/src/account/auth/token.service.ts`, `apps/api/src/account/auth/auth.module.ts`). تست winner یکتا، session isolation، unknown/expired و admin auth پاس است؛ کل API پس از تغییر `297/297` سبز و build/type/lint بدون error است. سناریوی integration موجود نیز در پایان دو درخواست refresh هم‌زمان می‌فرستد و دقیقاً یک winner/یک rejection مطالبه می‌کند (`apps/api/test/e2e-scenario.sh`)؛ syntax آن پاس است ولی اجرای تازهٔ replica-set/API در این نشست انجام نشد.

---

## موج صفر — پایهٔ قابل اعتماد

### G4M-001 — برگرداندن quality gate و build پایدار

- **وضعیت:** DONE (۲۰۲۶-۰۸-۱۶)
- **Persona/value:** همه؛ جلوگیری از انتشار کد ناسالم.
- **استوری/فاز:** زیرساخت فاز ۰، V1–V5.
- **شواهد بسته شدن:**
  - `npm run check-types` سبز (شامل `next typegen` برای mobile/website).
  - `npm run lint` سبز و بدون `--fix` روی API (`lint:fix` جدا).
  - buildهای `api` / `admin` / `website` / `mobile` موفق؛ CI هر چهار app را با timeout می‌سازد.
  - رفع type در `EquipmentBrowseCard` (className string برای `tv`) و HeroUI `role` روی wrapper.
  - `staticPageGenerationTimeout: 120` روی mobile و website.
- **دامنه:** `packages/ui`، `apps/mobile`، `apps/website`، `apps/api` lint، `.github/workflows/ci.yml`.
- **خارج از محدوده (عمداً باقی‌مانده):** cleanup عمیق React Compiler / unsafe-* روی API به‌صورت warn نگه داشته شد؛ pyramid تست کامل = G4M-002؛ حذف mock محصولی = G4M-020.

### G4M-002 — CI کامل، test pyramid و محیط integration

- **وضعیت:** DONE (۲۰۲۶-۰۸-۲۳)؛ اجرای رسمی GitHub Actions برای commit `14e49cfd` با هر ۹ job موفق بسته شد.
- **Persona/value:** تیم؛ جلوگیری از regression در درآمد، privacy و عملیات.
- **استوری/فاز:** همه؛ پیش‌نیاز Definition of Done.
- **دامنه:** `.github/workflows/ci.yml`، Jest، تست‌های API، mobile/admin/website.
- **کار:**
  - CI را به lint read-only، type-check، unit، integration، contract و build هر چهار app تقسیم کن.
  - MongoDB و Redis service container برای integration فراهم کن؛ seed تست کوچک و مستقل از demo بساز.
  - smoke shellها را به job کنترل‌شده با artifact/log و cleanup تبدیل کن.
  - برای frontend حداقل تست route/gate، adapter و critical form اضافه کن.
  - coverage برای کد جدید/تغییریافته حداقل ۸۰٪ branch و statement؛ دامنه مالی/privacy حداقل ۹۰٪ branch.
- **معیار پذیرش:** PR بدون اجرای تست رزرو/پرداخت/health قابل merge نباشد؛ failure قابل بازتولید و artifact تشخیصی داشته باشد.
- **edge:** watchman در CI خاموش؛ timezone روی `Asia/Tehran` و UTC هر دو تست شود.
- **شواهد فعلی:** Jest API واحد `56/56`، e2e readiness `2/2`، و سناریوهای bootstrap/progress، booking/waitlist/wallet، membership/check-in، integrity چندنقشی و سناریوی کامل coach accept → payment → check-in → complete روی Mongo replica-set و Redis موقت پاس شده‌اند. تست‌های mobile route/auth gate (`5`)، admin critical login form (`2`)، website store adapter (`6`) و storage adapter (`4`) نیز سبزند. policy مالی `96.87%` branch و `100%` statement و policy privacy/grant `100%` branch/statement دارد و threshold حداقل `90%` در Jest enforce می‌شود. اجرای کامل unitها در `Asia/Tehran` و `UTC` سبز است. CI به jobهای quality، frontend، unit دو-timezone، integration+OpenAPI و build چهار اپ تفکیک شده است.
- **شواهد runner رسمی:** [CI run 32599181368](https://github.com/hamidYeganeh/Gym4Me/actions/runs/32599181368)؛ lint/typecheck، frontend، unit در `Asia/Tehran` و UTC، Mongo/Redis integration، OpenAPI، تمام smokeهای چندنقشی و buildهای API/admin/mobile/website موفق‌اند.

### G4M-003 — شکستن God Serviceها و تعریف transaction boundary

- **Persona/value:** توسعه‌دهنده و عملیات؛ کاهش ریسک تغییر و قابلیت رشد تیم.
- **وضعیت:** DONE (۲۰۲۶-۰۸-۲۳)؛ اجرای رسمی GitHub Actions برای commit `5ee3202a` با هر ۹ job موفق بسته شد.
- **دامنه:** `ProgressService`، `FinanceService`، `CoachingService`، `MembershipsService`، `ClubsService`، `BookingsService`.
- **کار:**
  - facade عمومی را حفظ و use caseها را به command/query/policy/projector کوچک منتقل کن.
  - transaction coordinator مشترک برای Mongo session، retry transient و outbox داخل transaction تعریف کن.
  - دسترسی cross-domain فقط از API سرویس دامنه انجام شود؛ model یک دامنه مستقیم در دامنهٔ دیگر mutate نشود.
  - queryها projection و pagination محدود داشته باشند؛ no unbounded list.
- **معیار پذیرش:** هیچ رفتار API شکسته نشود؛ contract tests قبل/بعد یکسان؛ فایل جدید application service ترجیحاً زیر ۴۰۰ خط و یک مسئولیت داشته باشد.
- **ریسک:** refactor گسترده همراه feature ممنوع؛ هر استخراج باید characterization test داشته باشد.
- **شواهد بسته شدن:** هر شش facade هدف حداقل یک مرز application مستقل دارند. ایجاد رزرو مربی/باشگاه و verify پرداخت به commandهای زیر ۴۰۰ خط منتقل شده‌اند؛ gateway بیرون transaction و Booking + Finance/Ledger + Outbox در session مشترک مانده است. فروش عضویت نیز Membership + Coupon + Payment/Ledger + Debt + MembershipEvent را اتمیک و effect/audit را post-commit نگه می‌دارد. `BookingProjector`، `FinanceReadQuery`، `ListProgressMetricsQuery` و projector آن، `CoachingStudentsQuery` و projector آن، و `ClubsListQuery` read modelهای نقش‌محور را از facade جدا و همهٔ listها را با سقف page size برابر ۲۰۰ محدود کرده‌اند. مدل `ClubMembership` نیز از `FinanceService` حذف و شمارش مالی از API خواندنی دامنهٔ Membership انجام می‌شود. مجموعاً ۴۰ characterization test جدید اضافه شده و مجموعهٔ API `111/111` تست سبز دارد؛ همهٔ application serviceهای جدید زیر ۴۰۰ خط‌اند. `check-types` ده package، lint کامل monorepo و build API محلی سبزند. [CI run 32622127225](https://github.com/hamidYeganeh/Gym4Me/actions/runs/32622127225) نیز lint/typecheck، frontend، unit در `Asia/Tehran` و UTC، Mongo/Redis integration، contracts و buildهای API/admin/mobile/website را با موفقیت پاس کرده است.

---

## موج یک — Privacy و Health

### G4M-010 — اصلاح permission و failure semantics در Health Sync

- **وضعیت:** `VERIFY` در ۲۰۲۶-۰۸-۲۵؛ بسته‌شدن نهایی منوط به ماتریس تست permission روی دستگاه فیزیکی است.
- **Persona/value:** ATH؛ رضایت جزئی واقعاً محترم بماند و sync موفق کاذب نباشد.
- **استوری/سناریو:** H10–H14، ATH-IR-11/12، S19.
- **شواهد:** `flushHealthSamples` مجوز واقعی را با همهٔ کلیدها overwrite می‌کند و exception را `stub_empty` موفق ثبت می‌کند.
- **مدل‌ها:** `HealthSyncState`، `ProgressMetric`، `AthleteDataGrant`.
- **کار:**
  - فقط `authorizedMetricKeys` تأییدشدهٔ plugin/server حفظ شود؛ server اجازه توسعه scope از سوی client ندهد.
  - حالت‌ها را به `connected/syncing/synced/partial/error/disconnected` یا lifecycle سازگار تفکیک کن؛ در صورت تغییر enum، migration/backward compatibility بده.
  - empty واقعی، unsupported و provider error را جدا کن؛ فقط sync موفق `lastSyncAt` را جلو ببرد.
  - خطای per-metric و rejected sample قابل مشاهده و retryable باشد.
- **معیار پذیرش:** permission جزئی هرگز expand نشود؛ revoke در درخواست بعدی اعمال شود؛ failure به success تبدیل نشود؛ داده خام در log نباشد.
- **تست:** iOS/Android partial/denied/revoked، plugin unavailable، network failure، malformed sample، unit conversion.
- **event:** `health_sync_started/completed/partial/failed/disconnected` بدون مقدار سلامت.
- **شواهد VERIFY:** کلاینت فقط scopeهای `readAuthorized` را نگه می‌دارد، empty موفق را از provider/unsupported error جدا می‌کند، cursor هر metric را با overlap پنج‌دقیقه‌ای می‌خواند و در partial/error جلو نمی‌برد؛ API نیز scope را به پنج metric نصب‌شده محدود و update state را patch-compatible نگه می‌دارد. مرز ingestion اکنون `source=apple_health|health_connect` را فقط در state صریح `syncing` و برای metric مجاز می‌پذیرد، مسیر create تکی اجازهٔ جعل source دستگاه را نمی‌دهد و disconnect بدون توجه به payload کلاینت scope/cursor را سمت سرور پاک می‌کند (`apps/api/src/progress/health-sync-ingestion.policy.ts`, `apps/api/src/progress/progress.service.ts`, `apps/api/src/progress/health-sync-state-update.ts`). smoke محیط integration چرخهٔ connect → syncing → sync/dedupe → رد scope غیرمجاز → disconnect → رد ingestion و validation scope ناشناخته را پوشش می‌دهد (`apps/api/test/smoke-bootstrap-progress.sh`). این smoke در ۲۰۲۶-۰۸-۲۵ روی Mongo 7 replica-set و Redis واقعی محلی کامل پاس شد. مجموعهٔ API `221/221`، تست health موبایل `6/6`، typecheck و lint API و syntax/diff check محلی سبزند. Android plugin registration با `cap sync` تأیید و Podfile iOS به‌روز شده است.
- **مانده تا DONE:** اجرای device matrix برای iOS/Android شامل partial/denied/revoked، disconnect/reconnect و provider unavailable؛ build/pod verification روی محیط دارای Xcode کامل؛ و تأیید شناسهٔ native پایدار sample در نسخهٔ provider. نبود Xcode کامل در محیط فعلی و عدم مجوز ساخت artifact اندروید، build باینری native را در این اجرا قابل اثبات نکرد.

### G4M-011 — incremental Health Sync، cursor و offline queue واقعی

- **Persona/value:** ATH؛ sync بدون duplicate و بدون از دست‌دادن sample.
- **استوری/سناریو:** H9/H10، S18/S19.
- **کار:**
  - cursor جدا per metric/provider و overlap امن برای late-arriving samples.
  - source record id پایدار provider؛ hash ساخته‌شده از value فقط fallback نسخه‌دار باشد.
  - batch limit، retry-after، exponential backoff+jitter و dead-letter قابل اصلاح.
  - queue به user id scope شود و در logout/account switch رمزگذاری/پاک شود.
- **معیار پذیرش:** retry duplicate نسازد؛ crash وسط batch قابل resume؛ sample ردشده دلیل و CTA اصلاح داشته باشد.
- **تست:** duplicate concurrent، cursor migration، clock skew، timezone boundary، logout leakage.

### G4M-012 — حقوق داده و حذف حساب با retention روشن

- **Persona/value:** همه، به‌ویژه ATH؛ کنترل واقعی داده.
- **استوری:** H13، ATH-IR-11.
- **کار:**
  - account deletion request با status، cooling-off، revoke session و audit.
  - تفکیک delete/anonymize برای profile، health samples، media، social، messages و داده مالی غیرقابل‌حذف.
  - export async با expiry و download امن؛ admin view برای درخواست‌ها.
  - متن retention فارسی و consent history نسخه‌دار.
- **معیار پذیرش:** حذف حساب قابل درخواست/لغو/پیگیری؛ داده مالی طبق Ledger حفظ ولی PII حداقل/anonymized؛ media orphan پاک شود.
- **edge:** dispute/settlement باز، child account، impersonation، legal hold.
- **شواهد پیشرفت محلی (`PARTIAL`):** مدل additive درخواست حذف با lifecycle، unique active request، cooling-off هفت‌روزه و نسخه سیاست اضافه شد. ثبت تکراری idempotent است، ثبت موفق همه refresh/access sessionها را revoke می‌کند، شکست revoke درخواست تازه را rollback می‌کند، لغو فقط در cooling-off با predicate اتمیک مجاز است و هر دو mutation Audit دارند. shared client و `/athlete/data-rights` به status/request/cancel متصل‌اند و پس از درخواست session محلی نیز پاک می‌شود (`apps/api/src/schemas/account-deletion-request.schema.ts`, `apps/api/src/account/profile/account-data-rights.service.ts`, `packages/api/src/account/profile.client.ts`, `apps/mobile/src/modules/athlete/lib/AthleteDataRightsGate.tsx`). API ادمین و صفحهٔ read-only `/dashboard/ops/deletions` با pagination و فیلتر وضعیت اضافه شد و هیچ mutation پردازشی عرضه نمی‌کند (`apps/api/src/admin/admin.controller.ts`, `packages/api/src/admin/data-rights.client.ts`, `apps/admin/src/modules/ops/screens/AccountDeletionRequestsScreen/AccountDeletionRequestsScreen.tsx`). پردازش anonymize/delete، legal hold، child/guardian و export async عمداً تا تصویب ADR retention باز است.

### G4M-013 — observability و امنیت دادهٔ سلامت

- **Persona/value:** عملیات؛ تشخیص خطا بدون مشاهده PII.
- **کار:** correlation id، structured logs redacted، metrics latency/error/dedupe، alert برای revoke failure و duplicate spike، audit immutable.
- **معیار پذیرش:** dashboard و runbook برای sync failure؛ تست redaction؛ هیچ OTP/token/metric value در log و error tracking نباشد.

---

## موج دو — Discovery بدون دادهٔ ساختگی

### G4M-020 — حذف mock از مسیرهای production و demo isolation

- **وضعیت:** DONE (۲۰۲۶-۰۸-۲۳)
- **Persona/value:** GST/ATH/OWN؛ اعتماد به اطلاعات و جلوگیری از اقدام روی داده جعلی.
- **استوری:** C1–C4، K1، N3.
- **شواهد:** sports/classes/coach slots و notification inbox در error یا empty از fixtures استفاده می‌کنند.
- **کار:**
  - demo mode صریح، build-time و غیرقابل‌فعال‌شدن در production تعریف کن.
  - empty واقعی را empty نشان بده؛ error را error/retry؛ cache آخرین داده واقعی با برچسب stale مجاز است.
  - mock id هرگز به مسیر reserve/payment نرسد.
  - admin club form owner/category/sport را از API واقعی بگیرد.
- **معیار پذیرش:** جست‌وجوی production و inbox هیچ fixture نمایش ندهند؛ API outage قابل تشخیص باشد؛ demo route از analytics production جدا باشد.
- **تست:** empty 200، 404، 401، timeout، offline cache، mock-id navigation guard.
- **شواهد فعلی:** demo flag از phase خود Next مشتق و در export تولیدی حتی با env اشتباه `false` می‌شود؛ `/dev` در production به 404 تبدیل شده و تمام dynamic routeهای athlete/coach/owner/discovery فقط با ObjectId خنثی export می‌شوند. production gateهای هر سه نقش، community، search، wallet/payment، progress photo، dashboard و gallery metadata دیگر در empty/error یا unauthenticated به fixture و mutation صوری برنمی‌گردند. sports/classes/clubs/coaches/inbox و جزئیات club/coach/class/slot، empty واقعی را empty و outage را error با retry نشان می‌دهند؛ cache آخرین پاسخ واقعی discovery فقط با برچسب stale نمایش داده می‌شود. mock id به reserve/payment راه ندارد و فرم ساخت club ادمین owner/category/sport را از API واقعی می‌گیرد. تست‌های policy برای empty 200، خطاهای 404/401/timeout، offline stale cache و mock-id guard اضافه شده‌اند؛ suite موبایل `70/70`، type-check، lint بدون error و production build ۱۹۴ صفحه‌ای با `NEXT_PUBLIC_DEMO_MODE=true` سبزند، artifact نهایی flag را `false` ثبت می‌کند و اسکن متن قابل‌مشاهدهٔ ۱۸۷ HTML خروجی هیچ fixture شناخته‌شده‌ای پیدا نمی‌کند. [CI رسمی commit `b986bc03`](https://github.com/hamidYeganeh/Gym4Me/actions/runs/32626507483) شامل integration واقعی Mongo/Redis، قراردادها، frontend tests، unit در Tehran/UTC، lint/type و build هر چهار workspace سبز است.

### G4M-021 — discovery واقعی کامل و supply integrity

- **وضعیت:** `VERIFY` در ۲۰۲۶-۰۸-۲۵؛ implementation و gateهای محلی بسته‌اند و اجرای CI سناریوی seedشده روی Mongo/Redis واقعی مانده است.
- **Persona/value:** GST/ATH؛ انتخاب باشگاه/مربی/کلاس با اطلاعات قابل اعتماد.
- **استوری:** C1–C5، K1/K3، Q8/Q11.
- **کار:** فیلتر واقعی، نقشه، pagination، verified metadata، availability/pricing، review aggregate، branch/class/slot relationship و SEO parity.
- **معیار پذیرش:** یک club و coach seedشده از website و mobile تا reserve با همان id/price قابل دنبال‌کردن باشد؛ stale availability قابل پرداخت نباشد.
- **edge:** شهر بدون عرضه، branch غیرفعال، مربی منقضی‌المدرک، سانس لغوشده، geo permission denied.
- **شواهد فعلی:** endpointهای عمومی class/space/slot و membership plan فقط club تأییدشده و فعال و entity فعال/منتشرشده را برمی‌گردانند؛ calendar و create-booking در transaction دوباره club، تعلق class/space به همان club، وضعیت حساب مربی و verification مربی را بررسی می‌کنند و مبلغ را فقط از slot سرور می‌گیرند. branch و coach affiliation عمومی نیز inactive/unapproved را حذف می‌کنند. شناسهٔ navigation مربی در mobile/website برابر `userId` قرارداد detail/slot است و regression test دارد. filterهای availability/fresh/verified مربی از mobile تا DTO و Mongo query server-backed شده و card قیمت واقعی consultation را نمایش می‌دهد؛ map mobile نیز loading، empty و error/retry را تفکیک می‌کند. خلاصهٔ bounded قیمت پلن برای حداکثر ۵۰ باشگاه از planهای active/published با currency صریح IRT/IRR ارائه و در mobile/website مصرف می‌شود. credential ساخت‌یافتهٔ مربی (`typeKey/issuer/issuedAt/expiresAt`) در schema، DTO، review ادمین، projection عمومی و query-time expiry enforcement اضافه شده؛ رکورد legacy برای backward compatibility قابل مشاهده می‌ماند و seed دمو credential معتبر دارد. وب‌سایت `/classes` و `/classes/[classId]` با calendar/ظرفیت/قیمت سرور، canonical و JSON-LD اضافه شده و `/cities/[locationId]` نام entity واقعی شهر، club و coach را مصرف می‌کند؛ class/city نیز وارد sitemap شده‌اند. `e2e-scenario.sh` حالا همان club/class/coach/slot و snapshot قیمت را در قراردادهای عمومی website/mobile و رزرو assert می‌کند. API unit `182/182`، mobile `91/91` و `@repo/api` برابر `14/14` پاس‌اند؛ typecheck و lint هر پنج workspace بدون error، build API/admin و production build mobile (۱۹۴ route) و website (۲۰ route) با Webpack سبزند.
- **ماندهٔ VERIFY:** اجرای CI سناریوی seedشدهٔ توسعه‌یافته روی Mongo replica-set/Redis و ثبت evidence run. review aggregate باشگاه موجود است؛ review تفکیک‌شدهٔ مربی طبق J6/Q9 در Phase 7 و G4M-061 است و عمداً داخل G4M-021 جعل نمی‌شود. برای credentialهای approved legacy باید backfill عملیاتی زمان‌دار تعریف شود؛ fallback فعلی compatibility است، نه مدرک ساخت‌یافته.

---

## موج سه — هستهٔ درآمدی

### G4M-030 — رزرو اتمیک، ظرفیت و idempotency سراسری

- **وضعیت:** DONE (۲۰۲۶-۰۸-۲۳)
- **Persona/value:** ATH/CCH/OWN/STF؛ جلوگیری از overbooking و رزرو نیمه‌کاره.
- **استوری/سناریو:** D1–D13، O5–O7، P3/P4/P6، S2–S5/S14.
- **مدل‌ها:** `Booking`، `ClubSlotOccupancy`، `CoachSlot`، `Waitlist`, `ResourceCalendarBlock`.
- **کار:**
  - رزرو سری، occupancy، booking و outbox در Mongo transaction واحد.
  - unique/index و optimistic condition برای تعارض؛ retry transaction و idempotency response ثابت.
  - lock تقویم resource/coach/space و همراه مربی.
  - cancel/reschedule/TTL/waitlist offer با state machine معتبر.
- **معیار پذیرش:** تست ۵۰ درخواست هم‌زمان هرگز ظرفیت را رد نکند؛ crash/retry رزرو ناقص نسازد؛ callback تکراری side effect دوم نداشته باشد.
- **edge:** partial series، TTL هم‌زمان با verify، reschedule روی ظرفیت آخر، cancellation از یک تاریخ.
- **شواهد بسته شدن:** ایجاد رزرو تکی/سری، occupancy، snapshot رزرو و outbox در transaction مشترک انجام می‌شود؛ کلید idempotency اجباری و fingerprint payload از replay با دادهٔ متفاوت جلوگیری می‌کند. mutex نسخه‌ای تقویم club/slot/class/space/coach و بازهٔ مؤثر بافر قبل/بعد/رفت‌وآمد، رزرو و reschedule هم‌زمان را serialize می‌کند و blockهای تقویم هم در mutation و هم در availability عمومی enforce می‌شوند. cancel سری، TTL، verify پرداخت، reschedule، transition و waitlist offer/claim/expiry دارای state machine تراکنشی و side effect idempotent هستند. پذیرش می‌تواند برای عضو موجود یا مهمان رزرو بسازد و پروفایل Athlete استاندارد را حفظ کند؛ owner/staff و coach نیز endpoint جابه‌جایی با اعلان تراکنشی دارند. API unit `123/123`، frontend شامل mobile `70/70`، shared API `13/13`، admin `2/2` و website `6/6`، lint/typecheck و build هر چهار اپ سبزند. [CI رسمی commit `f9369600`](https://github.com/hamidYeganeh/Gym4Me/actions/runs/32629505118) تست ۵۰ درخواست هم‌زمان با ظرفیت ۱۷ را بدون oversell (`17` موفق و `33` conflict)، replay ثابت و payload-drift conflict روی Mongo replica-set واقعی، تمام smokeهای چندنقشی و buildها با موفقیت پاس کرده است.

### G4M-031 — پرداخت، coupon، wallet، refund و reconciliation واقعی

- **وضعیت:** VERIFY (۲۰۲۶-۰۸-۲۶؛ PSP طبق تصمیم فعلی mock و smoke/recovery دستگاهی خارج از scope؛ وضعیت فقط پس از تطبیق Definition of Done/ADR تغییر می‌کند)
- **Persona/value:** ATH/OWN/CCH/ADM؛ پول قابل اعتماد و قابل تطبیق.
- **استوری/سناریو:** D8/D9، L1–L8، K4، O1/O3/O4/O15، Q1/Q4، S2/S3/S11/S13.
- **مدل‌ها:** `Payment`، `LedgerEntry`، `Wallet`، `Coupon`، `Debt`، `Invoice`، `Payout`, `CashShift`.
- **کار:**
  - pricing engine واحد برای discount/tax/fee/split با snapshot نسخه‌دار.
  - validate/reserve/redeem/release coupon اتمیک و محدودیت usage.
  - Zarinpal create/verify با signature/authority/idempotency و webhook/callback recovery.
  - reconciliation job بین Payment، booking/membership و Ledger؛ reversal به‌جای delete/edit.
  - wallet cache rebuildable از Ledger؛ refund partial/full و dispute hold.
  - staging credentials و smoke واقعی کنترل‌شده؛ mock فقط test/dev.
- **معیار پذیرش:** identity مالی برای هر تراکنش balance شود؛ verify تکراری Ledger دوم نسازد؛ callback گمشده با reconciliation ترمیم شود.
- **edge:** مبلغ تومان/ریال، timeout بعد capture، refund بعد settlement، mixed tender discrepancy، coupon expiry وسط checkout.
- **شواهد VERIFY:** آغاز top-up و پرداخت رزرو فقط با intent پایدار و callback مجاز انجام می‌شود؛ verify مبلغ ذخیره‌شدهٔ سرور را مصرف می‌کند و reconciliation برای callback گمشدهٔ رزرو و کیف پول اضافه شده است. callback بومی Capacitor دیگر از origin محلی WebView استفاده نمی‌کند: مسیر عمومی HTTPS `payment-returns/native` فقط return pathهای رزرو/کیف پول/عضویت/اشتراک و پارامترهای allowlistشده را به scheme ثبت‌شدهٔ iOS/Android برمی‌گرداند و provider موبایل launch/appUrlOpen را به route داخلی امن تبدیل می‌کند (`apps/api/src/common/payment/payment-return.controller.ts`, `apps/mobile/src/shared/lib/payment-return.ts`, `apps/mobile/src/shared/providers/PaymentReturnProvider.tsx`). coupon در همان transaction رزرو با محدودیت سراسری و per-user مصرف می‌شود. refund کامل/جزئی با intent پایدار، reverse درگاه یا credit کیف پول، وضعیت Payment/Invoice و Ledger دوطرفهٔ متوازن تسویه می‌شود؛ cache کیف پول نیز از Ledger قابل بازسازی است. روی Mongo replica-set و Redis واقعی محلی نیز رقابت ظرفیت `17` برنده/`33` conflict، worker/outbox، bootstrap، رزرو، عضویت، integrity چندنقشی و سناریوی کامل OTP → عضویت → رزرو → پرداخت → check-in → لغو → refund ادمین با تراز Ledger پاس شدند. [CI رسمی commit `48023e88`](https://github.com/hamidYeganeh/Gym4Me/actions/runs/32633387297) هر ۹ job شامل integration و contract، تست‌های frontend، unit تهران/UTC، lint/type و build API/mobile/admin/website را با وضعیت Success پاس کرده است. طبق تصمیم محصول در ۲۰۲۶-۰۸-۲۶، PSP فعلاً mock می‌ماند و smoke/recovery پرداخت روی دستگاه لازم نیست؛ `VERIFY` صرفاً برای جلوگیری از تغییر بی‌ADR معیار تاریخی `DONE` حفظ شده است.

### G4M-040 — workerهای چند-instance و outbox قابل اتکا

- **وضعیت:** DONE (۲۰۲۶-۰۸-۲۳)
- **Persona/value:** SYS/OPS؛ اجرای بدون duplicate در scale.
- **استوری:** SYS-D13، R3–R7، N1.
- **کار:** lease/claim اتمیک برای jobs، distributed lock یا queue، retry/backoff/dead-letter، heartbeat و admin replay امن.
- **معیار پذیرش:** اجرای دو instance side effect تکراری نسازد؛ job crashشده reclaim شود؛ poison message بی‌نهایت loop نشود.
- **تست:** دو worker هم‌زمان برای booking expiry، waitlist expiry، lifecycle و outbox.
- **شواهد بسته شدن:** booking expiry، waitlist expiry و lifecycle به mutex توزیع‌شدهٔ Mongo با claim اتمیک، lease منقضی‌شونده و heartbeat مجهز شده‌اند؛ در نتیجه فقط یک instance هر tick را اجرا می‌کند و job رهاشده پس از crash قابل reclaim است. outbox هر پیام را جداگانه و اتمیک claim می‌کند، lease پیام را هنگام delivery تمدید می‌کند، پیام‌های `PROCESSING` منقضی یا legacy بدون lease را بازیابی می‌کند و با backoff نمایی و jitter پس از پنج شکست به `DEAD_LETTER` می‌فرستد. ارسال notification با کلید یکتای وابسته به outbox قبل از push/SMS پایدار می‌شود تا retry side effect دوم نسازد؛ dispatch ذخیره‌نشده نیز دیگر published محسوب نمی‌شود. endpointهای فقط-admin برای مشاهدهٔ lease/heartbeat، مشاهدهٔ outbox عملیاتی و replay اتمیک dead-letter بدون payload حساس اضافه شده‌اند و replay در audit log ثبت می‌شود. تست‌های دو worker برای هر سه job دوره‌ای، رقابت دو outbox worker، reclaim پس از crash، توقف poison message و retry اعلان ذخیره‌نشده اضافه شده‌اند. API unit `133/133`، frontend شامل mobile `70/70`، shared API `13/13`، admin `2/2` و website `6/6`، lint/typecheck و build هر چهار اپ محلی سبزند. [CI رسمی commit `b8b557b7`](https://github.com/hamidYeganeh/Gym4Me/actions/runs/32630547847) نیز روی Mongo replica-set واقعی رقابت ۲۰ instance برای lease و claim outbox، stale recovery و عدم claim دوبارهٔ dead-letter را همراه با تمام integration/smokeها و buildها با وضعیت Success پاس کرده است.

---

## موج چهار — عضویت و عملیات روزمره

### G4M-050 — عضویت، subscription enforcement و عملیات پذیرش

- **Persona/value:** OWN/STF/ATH؛ فروش، مصرف و تمدید روزانه.
- **استوری/سناریو:** E1–E4، F1–F3، O1–O4/O8/O11/O14، R5–R7/R12، S6/S12/S13/S15.
- **کار:**
  - lifecycle کامل membership: pending/active/frozen/expired/transferred/upgraded/cancelled با event immutable.
  - renewal و plan change با محاسبه اثر مالی و consent نسخه‌دار.
  - platform limit enforcement server-side و grace/read-only بدون حذف داده.
  - desk sale/import/debt/installment/cash shift end-to-end؛ member بدون اپ.
- **معیار پذیرش:** فروش حضوری تا رسید/Ledger/check-in؛ تمدید تا lifecycle exit؛ شاگرد ۲۱ در plan ۲۰ نفره واقعاً block شود.
- **edge:** guest بعداً account می‌سازد، import duplicate، freeze over expiry، debt partial، branch transfer.
- **شواهد پیشرفت محلی (هنوز `BLOCKED`):** mutationهای freeze/unfreeze/transfer/cancel/consume اکنون state + `MembershipEvent` + Outbox را در transaction واحد Mongo ثبت می‌کنند و transfer، holder اصلی را در رکورد immutable قبلی حفظ می‌کند (`apps/api/src/account/memberships/memberships.service.ts`, `apps/api/src/account/memberships/membership-lifecycle-transaction.spec.ts`). فروش عضویت نیز event و Outbox را در transaction فروش ثبت می‌کند (`apps/api/src/account/memberships/application/commands/sell-membership.command.ts`). تمدید همان plan برای پذیرش، preview قیمت/اثر اعتبار با fingerprint، consent نسخه‌دار، idempotency، پرداخت نقد/POS/کارت/ترکیبی، بدهی، Ledger، event و Outbox اتمیک دارد و از UI مالک بدون optimistic update قابل تأیید است (`apps/api/src/account/memberships/application/commands/renew-membership.command.ts`, `apps/mobile/src/modules/owner/screens/OwnerMembersScreen/OwnerMembersScreen.tsx`). خرید و تمدید آنلاین ورزشکار `MembershipCheckout` پایدار با PSP، Ledger و reconciliation دارد و سناریوی کامل آن روی replica-set پاس است (`apps/api/test/e2e-scenario.sh`). برای اشتراک پلتفرم، قرارداد entitlement نسخه‌دار و snapshot تغییرناپذیر، validation ادمین، backfill fail-safe، upgrade فوری با proration/fingerprint، downgrade انتهای دوره، cancel بدون قطع entitlement، lifecycle grace/fallback/read-only با lease و Outbox، و enforcement مرجع در club/staff/member mutationها اضافه شده است (`apps/api/src/schemas/platform-plan.schema.ts`, `apps/api/src/schemas/platform-subscription.schema.ts`, `apps/api/src/account/memberships/application/policies/platform-subscription-checkout.policy.ts`, `apps/api/src/account/memberships/application/services/platform-entitlement.service.ts`, `apps/api/src/account/memberships/application/services/platform-subscription-lifecycle.service.ts`, `apps/api/src/basics/seed/backfill-platform-entitlements.ts`, `apps/mobile/src/modules/owner/lib/OwnerPlatformSubscriptionGate.tsx`). UI مالک club scope را انتخاب می‌کند، usage/allowed هر limit، پایان دوره و grace، تغییر/لغو زمان‌بندی‌شده و cancel بدون قطع فوری entitlement را نمایش و کنترل می‌کند. مرز سریالی transaction برای ایجاد باشگاه/پرسنل/عضو اضافه شد و تست replica-set با ۲۰ درخواست هم‌زمان دقیقاً ۳ مجاز و ۱۷ ردشده ثبت کرد (`apps/api/src/schemas/platform-entitlement-boundary.schema.ts`, `apps/api/test/entitlement-concurrency.cjs`). مصرف `monthly_messages.transactional` نیز اکنون از fact تغییرناپذیر و idempotent در ماه مدنی تهران project می‌شود و Outbox پیش از dispatch اعلان باشگاهی سهمیه را رزرو می‌کند؛ retry یک پیام دوباره مصرف نمی‌سازد (`apps/api/src/schemas/platform-entitlement-usage.schema.ts`, `apps/api/src/outbox/outbox.service.ts`). سناریوی mock پرداخت نیز preview → upgrade/proration → verify/replay → downgrade → cancel را با یک Payment و یک Outbox پاس می‌کند (`apps/api/test/platform-subscription-scenario.cjs`)؛ checkout قدیمی با reference منقضی و CAS روی version/period رد می‌شود. وضعیت عمداً `BLOCKED` می‌ماند: ماتریس دستگاه هنوز باز است؛ PSP طبق تصمیم کاربر فعلاً mock است و شرط staging واقعی برای این slice تعلیق شده، نه اینکه پاس‌شده تلقی شود. همچنین ADR مبلغ را `gross + tax` نوشته ولی مدل مالی runtime، `gross` را شامل tax می‌داند (`apps/api/src/schemas/payment.schema.ts`)؛ تغییر این قرارداد مالی نیازمند addendum/ADR صریح است و در این اجرا silently تغییر نکرد.
- **اصلاح وضعیت:** انتخاب scope باشگاه در `/owner/subscription` اکنون متصل و قابل تغییر است؛ blocker باقی‌ماندهٔ این بخش فقط ماتریس دستگاه و recovery callback روی دستگاه است (`apps/mobile/src/modules/owner/lib/OwnerPlatformSubscriptionGate.tsx`).

### G4M-051 — check-in آفلاین امن و reconciliation

- **Persona/value:** STF/ATH؛ پذیرش در اینترنت ضعیف بدون مصرف تکراری.
- **استوری/سناریو:** D10، O9، Q7، S17.
- **کار:** snapshot امضاشده کوتاه‌عمر، nonce/device sequence، storage امن native، سقف تعداد/زمان، sync ordered و review queue.
- **معیار پذیرش:** replay و device revoked رد شوند؛ offline record محلی تا reconciliation حذف نشود؛ عملیات مالی آفلاین ممکن نباشد.
- **edge:** clock skew، secret rotation، membership consumed elsewhere، device theft.
- **شواهد پیشرفت محلی (هنوز `BLOCKED`):** API اکنون snapshot کوتاه‌عمر و HMAC-signed را فقط برای `CheckinDevice` فعال و متعلق به actor جاری صادر می‌کند؛ snapshot فهرست bounded رزرو/عضویت واجد شرایط، سقف ۱۰۰ event، window چهار ساعته و deadline همگام‌سازی ۲۴ ساعته دارد. هر event دارای sequence و nonce است، claim ترتیبی و reconciliation در transaction ثبت می‌شود، idempotency واقعی از snapshot/sequence/nonce سمت سرور مشتق می‌شود و payload drift، device revoked، credential rotation، actor/club mismatch، clock window و check-in زودهنگام رد می‌شوند. conflict با state authoritative به `review` می‌رود و mutation اصلی همچنان از مسیر transactional `CheckinService` انجام می‌شود (`apps/api/src/checkin/offline-checkin.service.ts`, `apps/api/src/schemas/checkin-offline-snapshot.schema.ts`, `apps/api/src/schemas/checkin-offline-reconciliation.schema.ts`). قرارداد shared snapshot/sync/review و revoke device افزوده شده و پذیرش Capacitor snapshot و صف را در secure storage نگه می‌دارد؛ فقط کد حاضر در snapshot را هنگام network failure queue می‌کند، sync را ordered انجام می‌دهد و فقط `created/duplicate` را حذف می‌کند (`packages/api/src/checkin`, `apps/mobile/src/modules/owner/lib/offline-checkin-queue.ts`, `apps/mobile/src/modules/owner/lib/OwnerCheckInDeskGate.tsx`). کلید امضای مستقل در production اجباری است و logout صف امن را پاک می‌کند. review queue اکنون در میز پذیرش با دلیل فارسی پایدار، retry idempotent، dismiss بدون ایجاد حضور/مصرف اعتبار، claim قابل‌بازیابی، تاریخچه append-only و AuditLog در دسترس است؛ resolved row محلی فقط پس از مشاهده نتیجهٔ server-authoritative پاک می‌شود. سناریوی واقعی replica-set برای provision → snapshot → sync → replay → reject → dismiss → revoke در `apps/api/test/e2e-scenario.sh` در ۲۰۲۶-۰۸-۲۵ کامل پاس شد؛ replay فقط یک مصرف اعتبار ساخت، rejected row dismiss شد و revoke دستگاه sync بعدی را رد کرد. task عمداً `BLOCKED` است چون dependency `G4M-050` بسته نشده و قطع/وصل شبکه و revoke روی دستگاه فیزیکی هنوز انجام نشده است.

---

## موج پنج — مربیگری، پیشرفت و retention

### G4M-060 — مربیگری و اجرای تمرین end-to-end

- **Persona/value:** CCH/ATH؛ تحویل خدمت اصلی مربی و مشاهده پیشرفت.
- **استوری/سناریو:** G1–G10، H1–H9/H14، P2/P5/P10/P11، S7/S8/S18.
- **کار:**
  - exercise custom → admin verification؛ program template/revision/diff/assignment.
  - session execution با draft/resume/offline، set status، RPE/pain، complete/abandon و revision immutable.
  - coach adherence/feedback طبق relationship و grant.
  - metric history واقعی برای catalog، summary روزانه/هفتگی و PR deterministic.
- **معیار پذیرش:** مربی برنامه نسخه‌دار می‌سازد، ورزشکار آفلاین اجرا و sync می‌کند، log به revision قدیمی متصل می‌ماند و مربی فقط scope مجاز را می‌بیند.
- **edge:** برنامه حین draft تغییر می‌کند، duplicate sync، relationship قطع، pain حساس، اصلاح log کامل‌شده.
- **شواهد پیشرفت محلی (`PARTIAL`):** lifecycle اجرای جلسه endpointهای authoritative و idempotent جدا برای complete/skip دارد و فرم موبایل reps/weight/duration/distance/RPE/pain/note و edit/remove ست را ثبت می‌کند. `WorkoutPlan.revisions` snapshot append-only و binding سمت سرور دارد؛ محدودیت بازسازی داده legacy برقرار است (`apps/api/src/schemas/workout-plan.schema.ts`, `apps/api/src/progress/workout-plan-revision.spec.ts`). صف آفلاین workout ترتیب `create → update → complete/skip` را با شناسه محلی، replay idempotent، reconnect خودکار، retry/discard recovery و cache برنامه نگه می‌دارد؛ محتوای native در Secure Storage است و logout آن را پاک می‌کند (`apps/mobile/src/shared/lib/offline-queue/offline-queue.ts`, `apps/mobile/src/shared/lib/workout-plan-cache.ts`, `apps/mobile/src/shared/lib/offline-queue/offline-workout-queue.test.ts`). review مربی append-only/idempotent است، فقط برای log کامل، مربی assign‌شده، رابطه فعال و grant `workouts.logs` پذیرفته می‌شود؛ mutation و Outbox اعلان در transaction واحد نوشته می‌شوند و ورزشکار بازخورد را در log می‌بیند (`apps/api/src/progress/progress.service.ts`, `apps/api/src/notifications/notification-defaults.ts`, `apps/mobile/src/modules/athlete/sections/AthleteWorkoutDetailLogsSection/AthleteWorkoutDetailLogsSection.tsx`). سناریوی جدید replica-set، assign → draft → replay → resume/set/RPE/pain → plan revision → complete/replay → اتصال log به revision قدیمی → coach review/replay → revoke grant و منع query-time را کامل پاس می‌کند (`apps/api/test/workout-execution-scenario.sh`). مانده فقط smoke قطع/وصل و secure-storage recovery روی دستگاه فیزیکی، conflict واقعی native و backfill محدود legacy است؛ تا آن زمان وضعیت `PARTIAL` می‌ماند.

### G4M-061 — رسانه، اجتماعی و تغذیه بدون placeholder

- **Persona/value:** ATH/CCH/ADM؛ تکمیل قابلیت‌های فاز ۷ پس از هسته.
- **استوری:** H2، I1–I3، J1–J6، M4/M7–M9.
- **کار:** upload واقعی رسانه با validation/scan/ownership، privacy، orphan cleanup، moderation و signed access؛ meal adherence و social media attachment واقعی.
- **معیار پذیرش:** متن «به‌زودی» در مسیر production نماند؛ upload لغوشده orphan نسازد؛ محتوای private از URL عمومی قابل دریافت نباشد.
- **edge:** فایل بزرگ/خراب، upload نیمه‌تمام، حذف post، report، blocked user، EXIF حساس.
- **شواهد پیشرفت محلی (`PARTIAL`):** مسیر production عکس پیشرفت از fixture خارج شد: انتخاب فایل واقعی، upload صریح `private` با purpose اختصاصی، دانلود authenticated به Blob URL و ثبت `ProgressPhoto` خصوصی متصل است. API پیش از persist مالکیت uploader، image MIME، private visibility و purpose را enforce و claim رسانه + ساخت photo را در transaction واحد انجام می‌دهد. حذف/جایگزینی attachment را آزاد و برای حذف storage علامت‌گذاری می‌کند؛ worker دارای lease فایل‌های آزادشده یا staged بیش از ۲۴ ساعت را با retry پاک می‌کند (`apps/mobile/src/modules/athlete/lib/AthleteProgressPhotosGate.tsx`, `packages/api/src/media/media.client.ts`, `apps/api/src/media/media.service.ts`, `apps/api/src/media/media-cleanup.worker.ts`, `apps/api/src/progress/progress.service.ts`). UI ویرایش privacy، حذف با تأیید، skeleton/error/retry دارد. رسانهٔ اجتماعی واقعی است: mobile تا ۴ تصویر private/staged بارگذاری می‌کند؛ API مالکیت/MIME/purpose را بررسی و در transaction همان post claim می‌کند، public/followers را با visibility درست نگه می‌دارد، delivery فایل followers را پس از بررسی follow انجام می‌دهد و replacement/delete را با cleanup تراکنشی می‌بندد (`apps/api/src/social/social.service.ts`, `apps/api/src/social/account-social.controller.ts`, `apps/api/src/social/social-media-policy.spec.ts`). feed/detail فایل را authenticated به Blob URL نمایش می‌دهند. ثبت وعده نیز عکس خصوصی واقعی، slot validation و claim اتمیک دارد (`apps/api/src/nutrition/nutrition.service.ts`, `apps/api/src/nutrition/meal-adherence-media-policy.spec.ts`, `apps/mobile/src/modules/athlete/lib/AthleteNutritionLogGate.tsx`). create پست و meal log کلید idempotency اجباری، fingerprint payload، unique index و recovery رقابت دارند؛ retry mutation یا audit دوم نمی‌سازد. pipeline upload ساختار JPEG/PNG/WebP را validate، EXIF/XMP/comment/text metadata را حذف، فایل خراب/trailing payload را رد و در شکست Mongo فایل storage را rollback می‌کند (`apps/api/src/common/utils/image-sanitize.util.ts`, `apps/api/src/common/utils/image-sanitize.util.spec.ts`). cleanup هر سه purpose مشترک و retry-safe است. malware scanner بیرونی و آزمون دستگاه واقعی باز است؛ وضعیت `BLOCKED/PARTIAL` تغییر نمی‌کند.

---

## موج شش — Ops، وب و گواهی انتشار

### G4M-070 — تکمیل ادمین، وب‌سایت و certification نهایی

- **Persona/value:** ADM/OPS/GST؛ اداره و عرضهٔ محصول کامل.
- **استوری:** M1–M10، L2/L4–L8، Q4/Q10، R8–R11، V3/V4/V6–V8، C5.
- **کار:**
  - admin data-rights، wallet/manual payments، referral/fraud، trust/safety، coaching ops، cleanup/expiry flag و reconciliation queue.
  - website FAQ، referral landing/attribution، canonical/schema/sitemap و parity دادهٔ عمومی.
  - FCM/Kavenegar/Zarinpal staging و native Android/iOS release checklist.
  - load/security/accessibility/RTL/Jalali/backup-restore/DR و observability certification.
- **معیار پذیرش:** تمام سناریوهای S1–S20 با providerهای staging یا sandbox رسمی و بدون fallback mock پاس شوند؛ runbook و rollback آماده باشد.
- **خروجی نهایی:** checklist بدون P0/P1 ناقص، گزارش تست، known limitations فقط P2، release sign-off.

> پیشرفت عملیات مالک در ۲۰۲۶-۰۸-۲۶: `/owner/debts` از fixture production خارج و به list بدهی باشگاه، وضعیت معوق/سوخت‌شده، Jalali و تسویهٔ کامل نقدی با idempotency پایدار و recovery متصل شد. `/owner/cash-shift` نیز open/close واقعی، چهار کانال شمارش، نرمال‌سازی رقم فارسی/عربی و failure/retry دارد. inventory از UI-only به vertical slice transaction+Outbox تبدیل شد (`apps/api/src/inventory`, `packages/api/src/inventory`, `apps/mobile/src/modules/owner/lib/OwnerInventoryGate.tsx`). تعطیلی مالک به `CalendarBlock` واقعی و create idempotent متصل شد؛ coupon مالک route و shared client واقعی دارد. broadcast باشگاه اکنون snapshot مخاطب dedupe‌شده، campaign immutable، create idempotent و یک Outbox هم‌تراکنش برای هر گیرنده دارد و فرم موبایل RHF/Zod است (`apps/api/src/schemas/club-broadcast.schema.ts`, `apps/api/src/lifecycle/lifecycle.service.ts`, `packages/api/src/lifecycle`, `apps/mobile/src/modules/owner/lib/OwnerBroadcastGate.tsx`). فاکتور مالک نیز از projection اشتباه «فاکتورهای خود کاربر» جدا و با scope `party.clubId`، pagination و نام محدود پرداخت‌کننده به `/owner/invoices` متصل شد (`apps/api/src/finance/owner-finance.controller.ts`, `apps/api/src/finance/finance.service.ts`, `apps/mobile/src/modules/owner/lib/OwnerInvoicesGate.tsx`). API unit `307/307`، mobile `105/105` و shared API `29/29` پاس‌اند. consent policy و workforce shift هنوز قرارداد runtime ندارند؛ family/guardian نیز وابسته به ADR است.

## Quality gate نهایی انتشار

```bash
npm ci
npm run lint
npm run check-types
npm test
npm run build -w api
npm run build -w mobile
npm run build -w admin
npm run build -w website
```

علاوه بر آن باید integration/concurrency/contract/security و سناریوهای S1–S20 در CI یا staging سبز باشند. هیچ suppress، `--force`، cast ناشناخته به `any` یا حذف تست برای سبزکردن gate پذیرفته نیست.
