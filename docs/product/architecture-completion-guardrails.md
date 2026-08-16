# ADR-001 — Guardrailهای معماری برای تکمیل Gym4Me

**Status:** Accepted for completion program  
**Date:** 2026-08-16  
**Scope:** همهٔ تغییرات [`cursor-implementation-master-plan.md`](./cursor-implementation-master-plan.md)

## Context

Gym4Me یک modular monorepo با NestJS/Mongoose، Next.js/Capacitor، Vite و packageهای مشترک است. محصول دامنه‌های زیادی دارد، اما چند سرویس ۱۴۰۰ تا ۳۲۰۰ خطی، تست کم، fallbackهای demo در مسیر واقعی و transaction boundaryهای پراکنده سرعت و ایمنی توسعه را محدود می‌کنند.

هدف، rewrite یا مهاجرت تکنولوژی نیست. معماری فعلی حفظ و به‌صورت تدریجی به vertical sliceهای کوچک، تست‌پذیر و دارای مرز تراکنش روشن تبدیل می‌شود.

## Decision

### ۱. Modular monolith حفظ می‌شود

- `apps/api` منبع حقیقت و MongoDB/Mongoose دیتابیس runtime باقی می‌ماند.
- microservice، PostgreSQL، Expo یا event broker جدید بدون ADR جدا وارد نمی‌شود.
- مرز دامنه در کد و قرارداد enforce می‌شود، نه با deploy جداگانه.

### ۲. ساختار backend بر اساس use case

هر دامنه می‌تواند تدریجی به این شکل برسد:

```text
apps/api/src/<domain>/
  <domain>.module.ts
  controllers/                 # HTTP only; no business rules
  dto/                         # validation + transport contract
  application/
    commands/                  # mutations + transaction boundary
    queries/                   # read models/projections
    policies/                  # authorization/domain decisions
    projectors/                # response mapping
  infrastructure/              # provider/repository adapters where useful
  <domain>.service.ts          # small compatibility facade, then removable
```

قواعد:

- controller فقط validation context و فراخوانی use case.
- command مالک transaction و idempotency است.
- policy بدون وابستگی UI و قابل unit test است.
- query فقط فیلدهای لازم را projection می‌کند و pagination محدود دارد.
- model یک دامنه از دامنه دیگر مستقیم mutate نمی‌شود؛ facade/application API فراخوانی می‌شود.
- استخراج تدریجی با characterization test؛ جابه‌جایی بزرگ یک‌باره ممنوع.

### ۳. Atomicity و side effect

برای هر mutation حساس ترتیب زیر اجباری است:

```text
validate actor/policy
→ claim idempotency key
→ Mongo transaction: domain state + Ledger (if money) + Outbox
→ commit
→ async delivery from Outbox
→ reconciliation for uncertain external outcome
```

- API خارجی داخل transaction طولانی فراخوانی نشود.
- state intent قبل از provider call ذخیره و نتیجه با idempotent finalize ثبت شود.
- rollback مالی با reversal entry است، نه update/delete Ledger.
- compensating action جای transaction محلی را فقط وقتی می‌گیرد که مرز خارجی اجتناب‌ناپذیر است؛ در این حالت state machine و reconciliation اجباری‌اند.

### ۴. قراردادهای frontend

- routeها thin و UI در module/screen/section می‌ماند.
- screen مستقیماً `fetch` نمی‌کند؛ فقط `@repo/api` یا adapter دامنه.
- stateهای `loading | empty | error | stale | offline | ready` صریح‌اند.
- production هیچ‌گاه خطا/empty را با fixture پر نمی‌کند.
- mock فقط در demo build/route جدا و بدون دسترسی payment/reservation.
- DTO سرور در app تکرار نمی‌شود؛ UI types فقط props/view state.
- متن user-facing hardcoded ممنوع؛ i18n و RTL/Jalali جزو تست پذیرش‌اند.

### ۵. `@repo/api` مرز پایدار کلاینت

ساختار پنج‌فایلی موجود (`client/endpoint/dto/keys/hooks`) حفظ می‌شود. endpoint string، DTO یا query key خارج از فایل مالک تعریف نمی‌شود. breaking change فقط طبق policy نسخه‌بندی انجام می‌شود.

### ۶. اندازه و مسئولیت کد

این اعداد guardrail بازبینی‌اند، نه هدف refactor بی‌دلیل:

- application service جدید: ترجیحاً کمتر از ۴۰۰ خط.
- React screen/section جدید: ترجیحاً کمتر از ۳۰۰ خط.
- function: یک use case و complexity قابل تست.
- فایل بالای ۶۰۰ خط هنگام تغییر feature باید برای extraction بررسی و نتیجه در PR ثبت شود.
- barrel بزرگ که bundle client را متورم می‌کند ممنوع؛ import مستقیم public path.

### ۷. داده و migration

- تغییر schema backward-compatible و additive باشد؛ حذف/rename با dual read/write و backfill نسخه‌دار.
- backfill idempotent، قابل resume، دارای dry-run و progress metric باشد.
- enum جدید باید رفتار safe برای client قدیمی داشته باشد؛ در غیر این صورت API v2.
- index جدید با query plan و اثر rollout ارزیابی شود.

### ۸. امنیت و privacy by default

- نقش جاری فقط `activeRole`; staff فقط permission grant.
- privacy و data grant در query-time API enforce شوند.
- Feature Flag مجوز نیست.
- secret فقط server/native secure storage؛ هیچ secret در `NEXT_PUBLIC_*` یا manifest.
- PII/OTP/token/health values redacted؛ audit با metadata حداقلی.
- export/delete/upload دارای rate limit، ownership و audit.

### ۹. Testing architecture

```text
unit       policy, pricing, state transition, mapper
integration Mongo indexes, transactions, idempotency, Redis/job lease
contract   OpenAPI ↔ @repo/api, backward compatibility
component  gates/forms/error-empty-offline states
e2e        persona scenario across API + UI + provider sandbox
chaos      timeout, duplicate callback, worker crash, partial network
```

تست happy path به‌تنهایی کافی نیست. هر mutation حساس حداقل duplicate، timeout، retry و unauthorized را پوشش می‌دهد.

### ۱۰. Observability و عملیات

- هر request/job یک correlation id.
- metricهای latency، error، retry، dedupe و queue age.
- alert روی payment mismatch، negative capacity، duplicate ledger، failed revoke و dead-letter.
- runbook برای payment reconciliation، stuck booking، provider outage، worker replay و rollback flag.
- log قابل جست‌وجو است اما داده حساس ندارد.

## Options considered

### Rewrite کامل با Clean Architecture

رد شد: ریسک توقف محصول و regression بالا است و ارزش کوتاه‌مدت ندارد.

### حفظ ساختار فعلی بدون مرزبندی جدید

رد شد: God Serviceها و transactionهای پراکنده با رشد دامنه هزینه و ریسک را تشدید می‌کنند.

### استخراج تدریجی use caseها در modular monolith

انتخاب شد: با stack و تصمیمات قفل‌شده سازگار است و امکان تحویل feature همراه refactor کنترل‌شده را می‌دهد.

## Consequences

- هر تغییر در ابتدا کمی زمان بیشتر برای تست و مرزبندی می‌گیرد.
- regression و coupling کاهش و توسعه موازی دامنه‌ها آسان‌تر می‌شود.
- facadeهای قدیمی مدتی با use caseهای جدید هم‌زیست خواهند بود.
- تیم باید وضعیت migration و debt را در backlog اصلی نگه دارد.

## Review checklist

- [ ] آیا use case و owner دامنه مشخص است؟
- [ ] آیا transaction/idempotency/recovery روشن است؟
- [ ] آیا authorization و privacy در API تست شده؟
- [ ] آیا UI همهٔ stateها را نشان می‌دهد و mock production ندارد؟
- [ ] آیا contract و migration backward-compatible است؟
- [ ] آیا تست failure/concurrency وجود دارد؟
- [ ] آیا telemetry بدون PII و runbook لازم اضافه شده؟
- [ ] آیا docs/checklist/scenario به‌روز شده‌اند؟
