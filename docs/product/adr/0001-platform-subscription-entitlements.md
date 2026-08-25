# ADR-0001 — قرارداد entitlement، تغییر پلن و grace اشتراک پلتفرم

- **وضعیت:** `ACCEPTED`
- **تاریخ:** ۲۰۲۶-۰۸-۲۵
- **تاریخ تأیید:** ۲۰۲۶-۰۸-۲۵ — تأیید صریح مالک محصول در task جاری
- **مالک تصمیم:** Product + Finance + Backend
- **دامنه:** `PlatformPlan` / `PlatformSubscription`؛ عضویت باشگاه خارج از این ADR است
- **استوری/سناریو:** F1–F3، S12، G4M-050

## زمینه و شواهد فعلی

`PlatformPlan.features: string[]` فقط متن کاتالوگ است و قرارداد قابل enforce نیست (`apps/api/src/schemas/platform-plan.schema.ts`). اشتراک فعال فقط `planId` را نگه می‌دارد؛ بنابراین ویرایش plan می‌تواند بدون consent، entitlement مشترک قبلی را عوض کند (`apps/api/src/schemas/platform-subscription.schema.ts`). checkout خرید اولیه snapshot قیمت/دوره و consent دارد، اما upgrade، downgrade، proration، limits و grace را مدل نمی‌کند (`apps/api/src/schemas/platform-subscription-checkout.schema.ts`). endpointهای account در وضعیت فعلی فقط برای `activeRole=club_owner` باز هستند (`apps/api/src/account/memberships/athlete-memberships.controller.ts`).

این ADR تصمیمات قفل‌شدهٔ فعلی را حفظ می‌کند:

- اشتراک پلتفرم از عضویت باشگاه جدا می‌ماند.
- پرداخت و اصلاح مالی با `Payment` و Ledger immutable انجام می‌شود.
- Feature Flag مجوز یا entitlement ایجاد نمی‌کند.
- تغییر حساس همراه Outbox و در صورت مالی‌بودن Ledger در transaction واحد است.

## تصمیم

### ۱. قرارداد نسخه‌دار entitlement

هر `PlatformPlan` یک قرارداد ساخت‌یافته و نسخه‌دار داشته باشد:

```ts
type PlatformEntitlementContract = {
  schemaVersion: 1;
  audience: "club_owner" | "coach";
  capabilities: string[];
  limits: Array<{
    key: string;
    value: number | null; // null = نامحدود
    mode: "hard" | "soft";
  }>;
  graceDays: number;
};
```

کلیدهای نسخهٔ اول owner محدود و registry-based باشند:

- `clubs.active`
- `staff.active_per_club`
- `members.active_per_club`
- `monthly_messages.transactional`

کلیدهای coach مانند `students.active` در contract با `audience=coach` مجاز می‌شوند، اما فروش coach تا زمانی که surface و checkout نقش مربی end-to-end نشده فعال نمی‌شود.

`features` فعلی برای backward compatibility و نمایش باقی می‌ماند، ولی authorization/enforcement فقط از contract ساخت‌یافته خوانده می‌شود.

### ۲. snapshot تغییرناپذیر

هنگام checkout، contract و نسخهٔ plan داخل checkout snapshot می‌شوند. هنگام fulfillment همان snapshot داخل `PlatformSubscription.entitlementSnapshot` ذخیره می‌شود. ویرایش بعدی کاتالوگ entitlement اشتراک موجود را تغییر نمی‌دهد؛ تغییر فقط در renewal/plan-change بعدی و با preview و consent نسخه‌دار اعمال می‌شود.

### ۳. ترتیب و زمان تغییر پلن

- **upgrade:** فوری؛ entitlement جدید فقط پس از verify موفق فعال می‌شود.
- **renewal همان plan:** از پایان دورهٔ فعلی ادامه پیدا می‌کند، نه از زمان پرداخت.
- **downgrade:** برای پایان دوره schedule می‌شود؛ کاهش فوری limit مجاز نیست.
- **cancel:** auto-renew را خاموش می‌کند و entitlement تا پایان دوره باقی می‌ماند؛ لغو فوری فقط عملیات پشتیبانی با دلیل و AuditLog است.
- هم‌زمان فقط یک checkout pending برای هر کاربر مجاز است؛ idempotency key semantics را قفل می‌کند.

### ۴. محاسبه مالی upgrade

اعتبار زمان استفاده‌نشدهٔ پلن قبلی از مبلغ دورهٔ کامل پلن جدید کم می‌شود:

```text
credit = oldPlanNetPrice × remainingSeconds / oldPeriodSeconds
payable = max(0, newPlanGross + newPlanTax - credit)
```

- محاسبه با عدد صحیح IRT انجام و مبلغ PSP صریحاً به IRR تبدیل می‌شود.
- snapshot شامل قیمت قدیم، زمان مرجع سرور، credit، مالیات، payable و rounding policy است.
- credit فقط discount همین upgrade است و Wallet balance ایجاد نمی‌کند.
- اگر payable صفر شود، mutation همچنان idempotent و transactional است ولی PSP فراخوانی نمی‌شود.
- refund یا correction بعدی با Ledger reversal انجام می‌شود.

گزینهٔ ساده‌تر «بدون proration و شروع دورهٔ جدید پس از پایان فعلی» رد شده است، چون CTA upgrade فوری را بی‌اثر و اعتماد مالی را ضعیف می‌کند.

### ۵. grace و read-only

- `graceDays` per-plan و پیش‌فرض ۷ روز است.
- پس از `period.end` وضعیت entitlement از `active` به `grace` می‌رود؛ داده حذف نمی‌شود.
- در grace، read/export و عملیات ایمنی/مالی/پشتیبانی باز می‌ماند؛ mutationهایی که مصرف limit را افزایش می‌دهند fail-closed هستند.
- renewal موفق در grace بدون ساخت دادهٔ جدید، entitlement را فعال می‌کند.
- پس از grace، fallback به پلن رایگان audience یا حالت read-only platform انجام می‌شود؛ انتخاب بین این دو باید در همان catalog به‌صورت صریح ثبت شود.

### ۶. enforcement سمت سرور

یک `PlatformEntitlementService` مرجع واحد باشد و نتیجه‌ای شامل `allowed`, `reasonCode`, `usage`, `limit`, `state`, `upgradePlanIds` برگرداند. controller یا UI مستقیماً `features` را تفسیر نمی‌کند.

- `hard`: mutation پیش از transaction با خطای پایدار رد می‌شود و داخل transaction نیز predicate/unique boundary مرتبط دوباره بررسی می‌شود.
- `soft`: mutation انجام می‌شود ولی exposure/notification با frequency cap ثبت می‌شود.
- کاهش plan یا تغییر admin هیچ داده‌ای را حذف نمی‌کند.
- activeRole و permissionهای staff قبل از entitlement بررسی می‌شوند؛ entitlement هرگز authorization را اعطا نمی‌کند.

## پیامدهای مدل و migration

- افزودن additive `entitlementContract` به `PlatformPlan`.
- افزودن additive `entitlementSnapshot`, `planVersion`, `graceEndsAt`, `scheduledPlanId` و lifecycle metadata به `PlatformSubscription`.
- افزودن additive old/new entitlement و proration snapshot به checkout.
- migration دو مرحله‌ای: ابتدا dual-read با contract پیش‌فرض نامحدود برای رکوردهای legacy؛ سپس backfill؛ در پایان enforcement فقط برای planهای `contractReady=true` فعال شود.
- هیچ فیلد فعلی حذف نمی‌شود و `/api/v1` breaking change ندارد.

## معیار پذیرش

1. ویرایش plan، entitlement اشتراک فعال قبلی را تغییر ندهد.
2. upgrade preview با زمان ثابت deterministic و fingerprintشده باشد.
3. callback تکراری فقط یک Payment capture، Ledger entry، subscription transition و Outbox event بسازد.
4. downgrade limit فعلی را تا پایان دوره کاهش ندهد.
5. grace داده را حذف نکند و mutation افزاینده را با reason code پایدار رد کند.
6. concurrency روی آخرین ظرفیت limit فقط تعداد مجاز برنده داشته باشد.
7. admin نتواند key ناشناخته، مقدار منفی یا audience ناسازگار ذخیره کند.
8. UI owner usage/limit/grace و CTA را از response سرور نمایش دهد؛ بدون optimistic update مالی.

## تصمیم‌های تأییدشده

این ADR چهار انتخاب زیر را قفل می‌کند:

1. upgrade فوری با credit زمان باقی‌مانده؛
2. downgrade در پایان دوره؛
3. grace پیش‌فرض ۷ روز و read-only برای mutation افزاینده؛
4. snapshot entitlement روی subscription و registry محدود keyها.

G4M-050 دیگر به‌دلیل policy این ADR مسدود نیست؛ dependencyها و Definition of Done مستقل آن همچنان باید بسته شوند.
