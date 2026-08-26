# Gym4Me — تسک‌های تکمیل سرویس‌ها برای Cursor AI

آخرین به‌روزرسانی: ۲۰۲۶-۰۸-۲۷

این سند backlog اجرایی شکاف‌های باقی‌ماندهٔ سرویس‌هاست. Cursor باید قبل از شروع هر تسک، `.cursor/rules/gym4me-implementation-execution.mdc` و اسناد مرجع همان تسک را بخواند و فقط یک تسک `READY` را در هر branch/PR انجام دهد.

## قواعد اجرا

- ترتیب پیشنهادی: `SVC-001 → SVC-002 → SVC-003 → SVC-004 → SVC-005`؛ تسک‌های `DECISION_GATE` فقط پس از تأیید صریح مالک محصول به `READY` تبدیل شوند.
- تکمیل یعنی vertical slice واقعی: API → `@repo/api` → mobile/admin لازم → تست unit/integration/concurrency → به‌روزرسانی مستندات.
- MongoDB/Mongoose منبع حقیقت است؛ microservice، PostgreSQL یا rewrite در scope نیست.
- authorization بر اساس `activeRole` و permission واقعی staff است. Feature flag مجوز ایجاد نمی‌کند.
- mutation حساس باید idempotent باشد؛ state دامنه و Outbox در transaction واحد و mutation مالی همراه Ledger immutable ثبت شود.
- دادهٔ سلامت، عکس پیشرفت و دادهٔ تغذیه پیش‌فرض `PRIVATE` می‌ماند.
- mock provider فقط در test/development مجاز است؛ production باید در نبود provider الزامی fail-fast یا fail-closed شود.
- smoke دستگاه فیزیکی، credential واقعی و تصمیم حقوقی را با تست ساختگی «پاس‌شده» اعلام نکن.
- تغییر status در master plan/checklist فقط پس از پاس همهٔ معیارهای پذیرش همان تسک انجام شود.

## نمای backlog

| ID | اولویت | وضعیت | عنوان | وابستگی |
|---|---|---|---|---|
| SVC-001 | P0 | VERIFY | پایدارسازی Health Sync آفلاین و recovery | G4M-010 در VERIFY |
| SVC-002 | P0 | VERIFY | تکمیل enforcement و cleanup اشتراک پلتفرم | ADR-0001 ACCEPTED |
| SVC-003 | P0 | VERIFY | تکمیل check-in آفلاین و telemetry قابل certification | SVC-002 برای بستن نهایی G4M-050 |
| SVC-004 | P1 | READY | سرویس اسکن بدافزار و quarantine رسانه | — |
| SVC-005 | P1 | READY | conflict/recovery و backfill محدود تمرین | SVC-001 |
| SVC-006 | P0 | DECISION_GATE | پردازش نهایی حذف/ناشناس‌سازی حساب | تصویب retention/legal-hold policy |
| SVC-007 | P1 | DECISION_GATE | رضایت‌نامه و اقرار نسخه‌دار باشگاه | تصویب O11/consent policy |
| SVC-008 | P1 | DECISION_GATE | شیفت کاری و قرارداد نیروی انسانی | تصویب K8/O12 workforce policy |
| SVC-009 | P1 | EXTERNAL_VERIFY | Push/FCM و deep-link روی دستگاه واقعی | build/credentials/device |

---

## SVC-001 — پایدارسازی Health Sync آفلاین و recovery

- **Persona/value:** ATH؛ ثبت داده در شبکه ضعیف بدون گم‌شدن یا duplicate و با revoke فوری permission.
- **اولویت:** P0
- **وضعیت فعلی:** incremental cursor، overlap، scope enforcement و dedupe سرور موجود است؛ صف آفلاین کامل، recovery پس از crash و telemetry عملیاتی هنوز بسته نشده‌اند.
- **استوری/سناریو:** H9–H10، H12–H13، S18–S19؛ G4M-011/013.
- **شواهد شروع:** `apps/mobile/src/shared/lib/health/health-sync.ts`، `apps/api/src/progress/health-sync-ingestion.policy.ts`، `apps/api/src/schemas/health-sync-state.schema.ts`.

### کار

1. صف native health را روی secure storage موجود بساز/تکمیل کن؛ item شامل provider، metric key، source record id، payload fingerprint، client mutation id، attempt و next retry باشد.
2. enqueue و flush را ordered، bounded و crash-safe کن؛ retry با exponential backoff و jitter، poison item با reason پایدار و recovery دستی داشته باشد.
3. disconnect یا revoke scope باید itemهای ارسال‌نشدهٔ همان provider/scope را purge و Audit/telemetry بدون payload سلامت ثبت کند.
4. cursor فقط پس از acknowledgement معتبر سرور جلو برود؛ batch جزئی باید created/deduplicated/rejected را مستقل reconcile کند.
5. status قابل‌فهم sync، آخرین موفقیت و recovery CTA را در mobile وصل کن؛ production error هرگز به empty/success جعلی تبدیل نشود.
6. eventهای queue depth، sync latency، retry، rejected reason و disconnect purge را بدون مقدار/یادداشت سلامت ثبت کن.

### معیار پذیرش

- kill/relaunch وسط flush هیچ sample را گم یا duplicate نکند.
- permission جزئی فقط metric مجاز را queue/sync کند و revoke قبل از flush مانع ارسال شود.
- دو flush هم‌زمان یک item را دو بار مصرف نکنند؛ replay سمت سرور idempotent بماند.
- batch با بخشی rejected، فقط موارد acknowledged را از صف حذف کند.
- سقف تعداد/سن item و رفتار storage corruption دارای recovery تست‌شده باشد.
- unit تست timezone تهران/UTC، تست reconnect و تست قرارداد `@repo/api` پاس شود.

### گیت خروج

`npm run check-types`، lint مرتبط، unitهای API/mobile و smoke Mongo/Redis موجود پاس؛ ماتریس Apple Health/Health Connect روی دستگاه به‌عنوان `EXTERNAL_VERIFY` صریح ثبت شود.

**شواهد ۲۰۲۶-۰۸-۲۷:** صف امن per-user (`health-sync-queue.ts` + secure storage)، enqueue/flush ordered با single-flight، partial reconcile (cursor فقط برای acknowledged)، purge روی disconnect/revoke scope، exponential backoff+poison+manual retry، telemetry ops بدون مقدار سلامت (`HealthSyncOpsTelemetry` → Audit/analytics events)، UI queue summary/recovery در `AthleteHealthSyncGate`. تست‌ها: mobile health `15/15`، API health-sync-state `6/6`. **مانده:** device matrix Apple Health/Health Connect و smoke replica-set کامل در این branch اجرا نشده.

---

## SVC-002 — تکمیل enforcement و cleanup اشتراک پلتفرم

- **Persona/value:** OWN/CCH/ADM؛ limits واقعی، grace قابل پیش‌بینی و upgrade بدون آسیب مالی.
- **اولویت:** P0
- **وضعیت فعلی:** snapshot entitlement، upgrade/downgrade/cancel و worker lifecycle عمدتاً موجود است؛ پوشش همهٔ mutationها، cleanup rollout و telemetry نهایی کامل نیست.
- **استوری/سناریو:** F1–F3، R12، V6/V8، S12؛ G4M-050.
- **تصمیم قفل‌شده:** `docs/product/adr/0001-platform-subscription-entitlements.md`.

### کار

1. registry کلیدهای entitlement را audit کن و تمام mutationهای owner مربوط به clubs/staff/members/messages را به `PlatformEntitlementService` مرجع وصل کن.
2. برای hard limit، pre-check و predicate/unique boundary داخل transaction را پوشش بده؛ soft limit فقط event/CTA frequency-capped بسازد.
3. lifecycle worker را برای lease چند-instance، retry idempotent و transitionهای `active → grace → fallback/read_only` کامل کن.
4. backfill رکورد legacy را resumable، bounded و idempotent کن؛ فقط رکوردهای `contractReady` وارد enforcement سخت شوند.
5. usage projection و reason code پایدار را در `@repo/api` و owner UI نمایش بده؛ mutation مالی optimistic نباشد.
6. flag/exposureهای تمام‌شده owner/expiry داشته باشند و cleanup auditشده برای آن‌ها اضافه شود؛ خودکار flag فعال را بدون تأیید حذف نکن.

### معیار پذیرش

- race روی آخرین ظرفیت دقیقاً تا limit برنده داشته باشد.
- ویرایش plan روی entitlement snapshot فعال اثر نگذارد.
- callback/reconciliation تکراری یک Payment/Ledger/transition/Outbox بسازد.
- grace read/export/support را باز و mutation افزاینده را با reason code پایدار ببندد.
- downgrade تا پایان دوره limit جاری را کاهش ندهد و fallback داده حذف نکند.
- تست unauthorized activeRole و staff permission مستقل از entitlement پاس شود.

### گیت خروج

تست unit، Mongo replica-set concurrency، worker lease و vertical slice owner پاس؛ checklist فقط برای سطوح واقعاً متصل به ✅ تغییر کند.

**شواهد ۲۰۲۶-۰۸-۲۷:** `unfreeze` اکنون `members.active_per_club` را داخل transaction با boundary serialize می‌کند؛ `PlatformEntitlementService` شامل `upgradePlanIds`، `reasonCode` در summary، soft-limit exposure ماهانه (`platform_entitlement_soft_limit`) و i18n `platform_subscription.*` است؛ backfill resumable با `{ batchSize, cursor, dryRun }` → `{ nextCursor, hasMore }`؛ `@repo/api` شامل `usePlatformEntitlements`؛ owner UI سقف نرم/ارتقا را نشان می‌دهد؛ feature flag `exposureEndsAt` + bootstrap filter + `PUT admin/app-config/feature-flags/archive-expired`. تست‌ها: entitlement unit `8/8`، backfill batch `1/1`، concurrency script `winners=3 denied=17`. **مانده:** worker lease smoke در این branch اجرا نشده.

---

## SVC-003 — تکمیل check-in آفلاین و telemetry قابل certification

- **Persona/value:** STF/OWN/ATH؛ پذیرش در قطعی شبکه بدون مصرف تکراری اعتبار.
- **اولویت:** P0
- **وضعیت فعلی:** snapshot امضاشده، secure queue، sequence/nonce، reconciliation و review/dismiss موجود است؛ observability، failure injection و certification دستگاه باز است.
- **استوری/سناریو:** D10، E3، O9، Q7، S17؛ G4M-051.

### کار

1. telemetry بدون PII برای snapshot issuance، queue depth، clock skew، replay، review/reject، retry و revoke اضافه کن.
2. failure injection تستی برای قطع شبکه، timeout پس از commit، پاسخ ناقص، clock skew و rotation credential فراهم کن؛ در production غیرفعال باشد.
3. recovery صف خراب/قدیمی و UX واضح برای `review/rejected` را کامل کن؛ resolved row فقط پس از مشاهدهٔ state authoritative پاک شود.
4. retention محدود snapshot/event محلی و پاک‌سازی logout/revoke را تست کن.
5. runbook certification Android/iOS شامل provision، offline scan، reconnect، duplicate، revoke و clock change بساز.

### معیار پذیرش

- timeout پس از commit با retry فقط یک attendance و یک membership consumption بسازد.
- event خارج snapshot، device/club/actor mismatch، credential قدیمی و sequence gap رد شوند.
- dismiss هیچ attendance/Ledger/credit consumption نسازد و resolution history/AuditLog حفظ شود.
- telemetry هیچ QR raw، device secret یا داده سلامت حمل نکند.
- تست replica-set و Redis واقعی موجود سبز بماند.

### گیت خروج

Cursor بخش کد و runbook را تحویل می‌دهد؛ تبدیل `PARTIAL` به `DONE` فقط پس از اجرای موفق runbook روی حداقل یک Android و یک iOS مجاز است.

**شواهد ۲۰۲۶-۰۸-۲۷:** PII-free ops telemetry (`CheckinOfflineOpsTelemetry`, `CHECKIN_OFFLINE_OPS` analytics + client `ops` on sync batch)؛ test-only failure injection via `OFFLINE_CHECKIN_TEST_FAILURES`؛ snapshot revoke on device revoke/rotate؛ mobile recovery CTA (`getOfflineCheckinQueueSummary`, stale/corrupt/revoked purge)؛ retention tests (logout purge, expired snapshot). Runbook: `docs/product/runbooks/offline-checkin-certification.md`. تست‌ها: API offline specs + mobile queue `7/7`. **مانده:** physical Android/iOS certification per runbook (EXTERNAL_VERIFY).

---

## SVC-004 — سرویس اسکن بدافزار و quarantine رسانه

- **Persona/value:** ATH/CCH/ADM؛ جلوگیری از انتشار فایل آلوده بدون شکستن privacy و upload recovery.
- **اولویت:** P1
- **وضعیت فعلی:** validation ساختاری، ownership/claim، storage و orphan cleanup موجود است؛ scanner خارجی وجود ندارد.
- **استوری/سناریو:** H2، I2، J2/J4/J5، M4؛ G4M-061.
- **شواهد شروع:** `apps/api/src/media/media.service.ts`، `apps/api/src/media/media-cleanup.worker.ts`، `apps/api/src/schemas/media.schema.ts`.

### کار

1. `MalwareScanner` port و providerهای `mock` برای test/dev و adapter واقعی configurable ایجاد کن؛ provider خاص را در domain hard-code نکن.
2. lifecycle رسانه را additive با وضعیت‌های `pending_scan/clean/infected/scan_failed/quarantined` و metadata کمینه/بدون secret مدل کن.
3. upload ابتدا private و غیرقابل claim/read عمومی باشد؛ فقط نتیجه `clean` اجازه claim/serve دهد.
4. worker اسکن را leaseدار، bounded، retryable و idempotent کن؛ infected را quarantine و attachment را ممنوع کند.
5. production در نبود scanner برای purposeهای حساس fail-closed شود؛ gallery عمومی legacy بدون migration ناگهانی نشکند.
6. admin queue محدود برای scan failure/infected با retry/delete auditشده اضافه کن؛ delete باید storage و metadata را سازگار پاک کند.

### معیار پذیرش

- race بین scan و claim هیچ فایل pending/infected را attach نکند.
- retry provider duplicate scan side effect یا media record دوم نسازد.
- URL یا endpoint عمومی فایل private/quarantined را برنگرداند.
- orphan/cancel cleanup برای local و object storage هر دو تست شود.
- تست EICAR یا fixture امن شبیه‌سازی‌شده فقط در محیط تست باشد؛ محتوای واقعی آلوده commit نشود.

### گیت خروج

unit/contract/integration media، social، progress photo و meal adherence پاس؛ انتخاب vendor/credential و smoke واقعی scanner به‌عنوان deployment gate ثبت شود.

---

## SVC-005 — conflict/recovery و backfill محدود تمرین

- **Persona/value:** ATH/CCH؛ اجرای تمرین آفلاین و حفظ revision صحیح بدون overwrite داده.
- **اولویت:** P1
- **وضعیت فعلی:** draft/resume، set/RPE/pain، queue امن، revision append-only و review موجود است؛ conflict native و backfill legacy باز است.
- **استوری/سناریو:** G2–G10، H9، P10–P11، S7.

### کار

1. version/fingerprint مورد انتظار را به mutationهای update/complete/skip enforce کن و conflict payload پایدار برگردان.
2. mobile conflict recovery بساز: دریافت state سرور، نمایش اختلاف، انتخاب retry امن یا discard؛ merge خودکار داده حساس انجام نده.
3. ترتیب `create → update → complete/skip` و terminal-state را زیر reconnectهای هم‌زمان و app restart سخت‌سازی کن.
4. backfill legacy فقط برای logهایی که binding آن‌ها deterministic است بساز؛ ambiguousها را report کن و حدس نزن.
5. command backfill باید dry-run، batch/cursor، resume، idempotency و summary قابل audit داشته باشد.
6. کامنت‌های قدیمی `Admin stubs` در coaching را پس از حفظ رفتار و تست به نام دقیق‌تر تغییر بده؛ scope جدید به endpointها اضافه نکن.

### معیار پذیرش

- ویرایش draft از دو device overwrite خاموش ایجاد نکند.
- complete تکراری یک terminal transition و یک Outbox بسازد.
- plan revision جدید اتصال log کامل‌شده به revision قبلی را تغییر ندهد.
- backfill دوباره‌اجراشدنی باشد و ambiguous record را mutate نکند.
- revoke رابطه/grant در query-time دسترسی مربی را فوراً قطع کند.

### گیت خروج

unit queue، API conflict، Mongo integration و smoke قطع/وصل مستند پاس؛ smoke دستگاه جداگانه ثبت شود.

---

## SVC-006 — پردازش نهایی حذف/ناشناس‌سازی حساب

- **وضعیت:** `DECISION_GATE`؛ Cursor حق شروع implementation نهایی را ندارد.
- **Persona/value:** ATH/همه؛ اعمال حق حذف بدون تخریب Ledger، AuditLog، دعاوی یا الزامات قانونی.
- **اولویت:** P0 از منظر privacy/compliance.
- **وضعیت فعلی:** request/cancel، cooling-off هفت‌روزه، revoke session و صف read-only ادمین موجود است؛ `retentionPolicyVersion` فعلی `pending-adr-1` است.
- **استوری/سناریو:** H13، Q11، G4M-012/013.

### تصمیم‌های لازم از مالک محصول/حقوقی

1. retention هر collection و مبنای قانونی نگهداری Ledger/Invoice/Audit/Dispute.
2. تعریف legal hold و actor مجاز به block/release.
3. delete در برابر anonymize برای User، health/progress/media/messages/social.
4. SLA، rollback window، backup semantics و رفتار حساب کودک/guardian.

### کار مجاز پیش از تصمیم

- فقط inventory داده، dependency map، ADR پیشنهادی و dry-run read-only تهیه شود؛ داده production mutate نشود.

### معیار پذیرش پس از ACCEPTED شدن ADR

- worker با lease، idempotency، resume و per-step checkpoint؛ transition اتمیک status و AuditLog.
- legal hold پردازش را fail-closed متوقف کند؛ release فقط با permission و reason.
- داده مالی immutable بماند و PII طبق policy tokenize/anonymize شود.
- media objectها، search/cache و token/deviceها نیز reconcile شوند.
- failure میانهٔ کار قابل retry باشد و completed زودهنگام ثبت نشود.

---

## SVC-007 — رضایت‌نامه و اقرار نسخه‌دار باشگاه

- **وضعیت:** `DECISION_GATE`؛ O11 هنوز در `market-requirements.md` پیشنهادی است.
- **Persona/value:** ATH/OWN/STF؛ اثبات نسخه، زمان و امضاکنندهٔ قوانین و اقرار سلامت.
- **اولویت:** P1
- **تصمیم لازم:** انواع consent، سن/guardian، revoke، اثر تغییر نسخه، scope شعبه/پلن و retention.

پس از تصویب، Cursor باید contract/version، acceptance append-only، preview hash، actor/guardian، expiry/revoke، enforcement server-side و UI Jalali/RTL را به‌صورت vertical slice بسازد. پذیرش تکراری idempotent، تغییر متن بدون version جدید ممنوع و داده سلامت از analytics/notification payload حذف باشد.

---

## SVC-008 — شیفت کاری و قرارداد نیروی انسانی

- **وضعیت:** `DECISION_GATE`؛ K8/O12 هنوز semantics قفل‌شده ندارند.
- **Persona/value:** OWN/STF/CCH؛ برنامه شیفت و محاسبه سهم بدون انتساب مالی اشتباه.
- **اولویت:** P1
- **تصمیم لازم:** مدل قرارداد، overtime/leave، branch/timezone، approval، payroll boundary و رابطه با `CashShift` و settlement.

پس از تصویب، Cursor باید شیفت کاری را از `CashShift` مالی جدا نگه دارد، staff permission و `activeRole` را enforce کند، overlap را اتمیک ببندد و هر محاسبه مالی را با fact نسخه‌دار و Ledger/settlement موجود یکپارچه کند. تقویم UI شمسی، transport UTC و هفته شنبه‌اول باشد.

---

## SVC-009 — Push/FCM و deep-link روی دستگاه واقعی

- **وضعیت:** `EXTERNAL_VERIFY`؛ این تسک عمدتاً certification است، نه feature coding.
- **Persona/value:** همه؛ دریافت اعلان تراکنشی و recovery مطمئن.
- **استوری/سناریو:** N1/N3، S22.

### ماتریس اجرا

- Android و iOS: permission allow/deny، foreground، background، terminated، tap/deep-link، logout revoke و token rotation.
- payload خصوصی/KYC/health ممنوع؛ inbox منبع پایدار باشد.
- `UNREGISTERED` device را revoke کند؛ retry اعلان دامنهٔ دوم نسازد.
- نتیجه با build، OS، timestamp، event id redacted و screenshot/log ثبت شود.

اگر failure ناشی از کد بود، یک bug task مستقل با reproduction و تست regression ساخته شود؛ نبود credential/device نباید با mock به `DONE` تبدیل شود.

## Definition of Done مشترک برای Cursor

برای هر تسک قابل‌پیاده‌سازی، خروجی نهایی باید این موارد را گزارش کند:

1. فایل‌های تغییرکرده و دلیل تغییر.
2. migration/backfill و روش rollback یا recovery.
3. تست‌های اجراشده با exit code واقعی.
4. سناریوهای unauthorized، retry، duplicate و concurrency.
5. مواردی که نیازمند credential، دستگاه، staging یا تصمیم انسانی هستند.
6. به‌روزرسانی `cursor-implementation-master-plan.md`، `checklist.md`، `scenarios.md` و `phases.md` فقط به اندازهٔ شواهد واقعی.

## Prompt شروع پیشنهادی برای Cursor

```text
تسک SVC-XXX از docs/product/cursor-service-completion-tasks.md را اجرا کن.
ابتدا rule اجرای backlog، decisions.md، ADR و story/scenarioهای مرتبط را کامل بخوان.
فقط اگر status تسک READY و dependencyها بسته‌اند شروع کن؛ در DECISION_GATE توقف و تصمیم لازم را گزارش کن.
یک vertical slice production-ready بساز، تغییرات کاربر را حفظ کن، mock production اضافه نکن، و تست failure/retry/concurrency/authorization را اجرا کن.
در پایان status مستندات را فقط بر اساس شواهد واقعی به‌روزرسانی و command/exit code تست‌ها و گیت‌های انسانی باقی‌مانده را گزارش کن.
```
