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
| G4M-010    | P0     | BLOCKED     | اصلاح permission و failure semantics در Health Sync   | G4M-002                      |
| G4M-011    | P0     | BLOCKED     | incremental Health Sync، cursor و offline queue واقعی | G4M-010                      |
| G4M-012    | P1     | BLOCKED     | حقوق داده و حذف حساب با retention روشن                | G4M-010                      |
| G4M-013    | P1     | BLOCKED     | observability و امنیت دادهٔ سلامت                     | G4M-011, G4M-012             |
| G4M-020    | P0     | DONE        | حذف mock از مسیرهای production و demo isolation       | G4M-002                      |
| G4M-021    | P0     | BLOCKED     | discovery واقعی کامل و supply integrity               | G4M-020                      |
| G4M-030    | P0     | DONE        | رزرو اتمیک، ظرفیت و idempotency سراسری                | G4M-003                      |
| G4M-031    | P0     | VERIFY      | پرداخت، coupon، wallet، refund و reconciliation واقعی | G4M-030                      |
| G4M-040    | P0     | DONE        | workerهای چند-instance و outbox قابل اتکا             | G4M-003                      |
| G4M-050    | P0     | BLOCKED     | عضویت، subscription enforcement و عملیات پذیرش        | G4M-021, G4M-031, G4M-040    |
| G4M-051    | P0     | BLOCKED     | check-in آفلاین امن و reconciliation                  | G4M-050                      |
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

- **Persona/value:** GST/ATH؛ انتخاب باشگاه/مربی/کلاس با اطلاعات قابل اعتماد.
- **استوری:** C1–C5، K1/K3، Q8/Q11.
- **کار:** فیلتر واقعی، نقشه، pagination، verified metadata، availability/pricing، review aggregate، branch/class/slot relationship و SEO parity.
- **معیار پذیرش:** یک club و coach seedشده از website و mobile تا reserve با همان id/price قابل دنبال‌کردن باشد؛ stale availability قابل پرداخت نباشد.
- **edge:** شهر بدون عرضه، branch غیرفعال، مربی منقضی‌المدرک، سانس لغوشده، geo permission denied.

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

- **وضعیت:** VERIFY (۲۰۲۶-۰۸-۲۳؛ منتظر smoke کنترل‌شدهٔ زرین‌پال staging)
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
- **شواهد VERIFY:** آغاز top-up و پرداخت رزرو فقط با intent پایدار و callback مجاز انجام می‌شود؛ verify مبلغ ذخیره‌شدهٔ سرور را مصرف می‌کند و reconciliation برای callback گمشدهٔ رزرو و کیف پول اضافه شده است. coupon در همان transaction رزرو با محدودیت سراسری و per-user مصرف می‌شود. refund کامل/جزئی با intent پایدار، reverse درگاه یا credit کیف پول، وضعیت Payment/Invoice و Ledger دوطرفهٔ متوازن تسویه می‌شود؛ cache کیف پول نیز از Ledger قابل بازسازی است. unit API `156/156`، Nest e2e `2/2`، typecheck و lint بدون error پاس شده‌اند. روی Mongo replica-set و Redis واقعی محلی نیز رقابت ظرفیت `17` برنده/`33` conflict، worker/outbox، bootstrap، رزرو، عضویت، integrity چندنقشی و سناریوی کامل OTP → عضویت → رزرو → پرداخت → check-in → لغو → refund ادمین با تراز Ledger پاس شدند. [CI رسمی commit `48023e88`](https://github.com/hamidYeganeh/Gym4Me/actions/runs/32633387297) هر ۹ job شامل integration و contract، تست‌های frontend، unit تهران/UTC، lint/type و build API/mobile/admin/website را با وضعیت Success پاس کرده است. برای `DONE` فقط smoke کنترل‌شده با credential واقعی staging زرین‌پال باقی مانده است.

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

### G4M-051 — check-in آفلاین امن و reconciliation

- **Persona/value:** STF/ATH؛ پذیرش در اینترنت ضعیف بدون مصرف تکراری.
- **استوری/سناریو:** D10، O9، Q7، S17.
- **کار:** snapshot امضاشده کوتاه‌عمر، nonce/device sequence، storage امن native، سقف تعداد/زمان، sync ordered و review queue.
- **معیار پذیرش:** replay و device revoked رد شوند؛ offline record محلی تا reconciliation حذف نشود؛ عملیات مالی آفلاین ممکن نباشد.
- **edge:** clock skew، secret rotation، membership consumed elsewhere، device theft.

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

### G4M-061 — رسانه، اجتماعی و تغذیه بدون placeholder

- **Persona/value:** ATH/CCH/ADM؛ تکمیل قابلیت‌های فاز ۷ پس از هسته.
- **استوری:** H2، I1–I3، J1–J6، M4/M7–M9.
- **کار:** upload واقعی رسانه با validation/scan/ownership، privacy، orphan cleanup، moderation و signed access؛ meal adherence و social media attachment واقعی.
- **معیار پذیرش:** متن «به‌زودی» در مسیر production نماند؛ upload لغوشده orphan نسازد؛ محتوای private از URL عمومی قابل دریافت نباشد.
- **edge:** فایل بزرگ/خراب، upload نیمه‌تمام، حذف post، report، blocked user، EXIF حساس.

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
