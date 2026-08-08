# Gym4Me — تصمیمات قفل‌شدهٔ محصول و معماری

آخرین به‌روزرسانی: ۲۰۲۶-۰۸-۰۴

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

## شکل مدل دامنه

- به‌جای boolean از enum/status استفاده شود (`status: active` نه `isActive`).
- فیلدهای مرتبط در آبجکت تو در تو گروه‌بندی شوند (`name: { first, last }`).
- جزئیات در `.cursor/rules/domain-model-shape.mdc`.

> رانتایم و منبع حقیقت دامنه: MongoDB با Mongoose (`apps/api/src/schemas`). PostgreSQL در محدودهٔ محصول نیست.
