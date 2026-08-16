# Gym4Me — تصمیمات قفل‌شدهٔ محصول و معماری

آخرین به‌روزرسانی: ۲۰۲۶-۰۸-۱۶

## نقش‌ها و احراز هویت

- یک کاربر می‌تواند چند نقش داشته باشد (`User.roles: Role[]`).
- توکن دسترسی باید **نقش فعال** (`activeRole`) داشته باشد، نه فقط لیست نقش‌ها.
- `roles` در JWT برای نمایش سوئیچر در کلاینت نگه داشته می‌شود؛ **مجوزها فقط از `activeRole`** خوانده می‌شوند.
- سرویس Role-Switch: `POST /account/auth/switch-role` → اعتبارسنجی عضویت نقش → صدور access/refresh جدید با `activeRole` → revoke توکن قبلی.
- UX: یک اپ موبایل واحد با سوئیچر نقش (`athlete` / `coach` / `owner`).

## دسترسی پرسنل باشگاه

- مجوزها با `PermissionDefinition` و کلیدهای استاندارد:
  - `bookings.create`, `bookings.read`, `bookings.checkin`
  - `finance.read`, `finance.settle`
  - `members.checkin`, `members.manage`
  - `staff.manage`, `sessions.manage`, `reports.read`
- نقش‌های آماده (پذیرش، حسابدار، …) فقط preset مجوز هستند؛ مجوز نهایی per-staff است.

## رزرو

- رزرو دوره‌ای با `recurringGroupId`؛ لغو تک‌جلسه و لغو کل سری هر دو پشتیبانی می‌شود.
- هر منبع (زمین/سالن، سانس، مربی، کلاس) تقویم و ظرفیت مستقل دارد.
- `BookingStatus`:
  `PENDING` | `AWAITING_PAYMENT` | `CONFIRMED` | `CHECKED_IN` | `COMPLETED` |
  `CANCELLED` | `NO_SHOW` | `REFUND_REQUESTED` | `REFUNDED` | `REJECTED`

## حریم خصوصی

- متریک‌ها، تصاویر پیشرفت و برنامه غذایی پیش‌فرض `PRIVATE`.
- Enforcement در API (نه فقط مدل).
- سطوح: `PUBLIC` | `FOLLOWERS` | `COACH_ONLY` | `PRIVATE`.

## مالی

- دو نوع عضویت کاملاً جدا:
  - پلتفرم: `PlatformPlan` / `PlatformSubscription`
  - باشگاه: `ClubMembershipPlan` / `ClubMembership`
- Ledger تغییرناپذیر (double-entry) منبع حقیقت است؛ `Wallet.balance` فقط cache مشتق‌شده.
- تقسیم تراکنش:
  `مبلغ − تخفیف − مالیات − سهم ارائه‌دهنده − کمیسیون − کارمزد درگاه = قابل تسویه`

## سرویس‌های خارجی

| سرویس | ارائه‌دهنده | الگو |
|--------|-------------|------|
| SMS | کاوه‌نگار | `SmsService` + `SMS_PROVIDER=kavenegar\|mock` |
| پرداخت | زرین‌پال | `PaymentGatewayService` + `PAYMENT_PROVIDER=zarinpal\|mock` |

## استک محصول

| محصول | مسیر |
|--------|------|
| Backend | `apps/api` (NestJS — منبع حقیقت) |
| اپ واحد موبایل | `apps/mobile` |
| پنل ادمین | `apps/admin` |
| وب‌سایت | `apps/website` |
| UI مشترک | `@repo/ui` + `@heroui/react` + `@repo/icons` |

## معماری تکمیل و توسعه‌پذیری

- معماری runtime یک **modular monolith** باقی می‌ماند؛ microservice یا rewrite کامل بدون ADR مستقل وارد نمی‌شود.
- God Serviceها به‌صورت تدریجی و همراه characterization test به command/query/policy/projectorهای کوچک استخراج می‌شوند.
- mutation حساس، state دامنه و Outbox را در transaction محلی واحد ثبت می‌کند؛ عملیات مالی Ledger را نیز در همان مرز می‌نویسد.
- جزئیات الزام‌آور در [`architecture-completion-guardrails.md`](./architecture-completion-guardrails.md) ثبت شده‌اند.

## شکل مدل دامنه

- به‌جای boolean از enum/status استفاده شود (`status: active` نه `isActive`).
- فیلدهای مرتبط در آبجکت تو در تو گروه‌بندی شوند (`name: { first, last }`).
- جزئیات در `.cursor/rules/domain-model-shape.mdc`.

## نسخه‌بندی API و انتشار پویا

- Bootstrap نسخه‌خنثی: `GET /api/app-config/bootstrap` با `schemaVersion` مستقل از URI دامنه.
- افزودن field/endpoint سازگار در `/api/v1`؛ `/api/v2` فقط برای breaking change واقعی.
- هم‌زیستی حداقل دو نسل API (v1 و v2) حداقل ۶ ماه، مگر رخداد امنیتی.
- Feature Flag فقط کد از قبل نصب‌شده را فعال می‌کند و جای authorization نیست.
- Fail-safe: فلوهای خرید/ورود روی last-known-good یا bundled default fail-open؛ فیچر آزمایشی fail-closed.
- OTA وب‌باندل Capacitor خارج از محدودهٔ فعلی (تصمیم مستقل و امنیتی جداگانه لازم است).

## دادهٔ سلامت و Self Tracking

- متریک‌ها catalog-driven با `MetricType`؛ sample عمومی در `ProgressMetric` (نه collection جدا per-metric).
- Grant داده به مربی per-metric/scope و زمان‌دار است؛ revoke فوری در query-time اعمال می‌شود.
- Reminder متریک پیش‌فرض خاموش است و فقط با opt-in فعال می‌شود.
- پس از disconnect از Apple Health / Health Connect، sync متوقف می‌شود؛ sampleهای قبلی تا حذف صریح کاربر حفظ می‌مانند.

> رانتایم و منبع حقیقت دامنه: MongoDB با Mongoose (`apps/api/src/schemas`). PostgreSQL در محدودهٔ محصول نیست.
