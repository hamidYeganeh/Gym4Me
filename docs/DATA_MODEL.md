# مدل داده و توسعه‌پذیری

## سیاست ذخیره‌سازی

### ستون ثابت

برای `id`، مالکیت، `status_code`، تاریخ، مبلغ، ظرفیت، Scope و Foreign Key استفاده می‌شود.

### Embedded Object در MongoDB

برای Value Objectهایی که با هم خوانده و نوشته می‌شوند و Constraint مالی/رزروی ندارند:

- settings
- capabilities
- presentation
- notification preferences
- validation rules
- visibility rules
- provider metadata
- custom_data

### Collection مستقل یا Subdocument تکرارشونده

برای داده تکرارشونده، رابطه‌ای یا قابل Query:

- Branchها
- Gallery
- Participants
- RoleAssignments
- Resources
- LedgerEntries
- Membership beneficiaries

## مدل‌های سیستم داینامیک

- entity_type_definitions
- field_group_definitions
- field_definitions
- field_option_definitions
- form_definitions
- form_sections
- status_definitions
- workflow_definitions
- workflow_states
- workflow_transitions
- taxonomies
- taxonomy_terms
- entity_taxonomy_assignments
- feature_flags
- system_settings

## مدل‌های عملیاتی

- Account: users، credentials، otp challenges، sessions، device installations، profiles
- RBAC: roles، permissions، role permissions، role assignments
- Supply: organizations، clubs، branches، resources، offerings، availability
- Booking: holds، series، bookings، participants، allocations، history، check-ins
- Pricing: quotes، quote items و snapshots
- Finance: wallets، ledger accounts، transactions، entries، payments، refunds، invoices، settlements، commission rules و tax rules
- Membership: products، scopes، contracts، beneficiaries، usage
- Coaching: relationships و messages با Scope مشترک مربی و شاگرد
- Corporate: accounts، contracts، members، rules، allocations و usage
- Subscription (deferred): مدل‌های اولیه plans، prices، entitlements، subscriptions و usage counters فقط برای توسعه آینده حفظ شده‌اند و در نسخه فعلی API یا UI عملیاتی ندارند.
- Advertising: accounts، campaigns، creatives، targeting، budget و events
- Platform: notifications، verifications، reviews، audit logs و outbox events

## مدل اجرایی رزرو و مالی

```text
PricingQuote
  └── occurrences[] + allocations[] + participants[] + pricing snapshot
BookingHold
  └── tokenHash + expiresAt + allocations[]
WaitlistEntry
  └── requested period + participants + FIFO offer lifecycle
BookingSeries
  └── recurrence + bookingIds[]
Booking
  └── one occurrence + participants[] + payment snapshot
CancellationPolicy
  └── scope(organization|club) + rules[] + fallbackPenalty + version
AccessPass
  └── tokenHash + participant + validity + single-use status
CheckIn
  └── accessPassId + checkedInAt + checkedOutAt

Wallet
  └── LedgerAccount
      └── LedgerTransaction.entries[] (debit = credit)
Payment
  └── LedgerTransaction
Refund
  └── compensating LedgerTransaction
TaxRule
  └── scope(organization|branch|offering) + calculation + validity + priority
DeviceInstallation
  └── installationId + platform + provider token (server-only) + lifecycle
```

- موجودی Wallet ذخیره و overwrite نمی‌شود؛ با aggregate روی entryهای `posted` محاسبه می‌شود.
- `LedgerTransaction` پس از ثبت append-only است و اصلاح مالی با سند جبرانی انجام می‌شود.
- هر command حساس یک `IdempotencyRecord` با hash درخواست دارد؛ استفاده مجدد از کلید با payload متفاوت رد می‌شود.
- Quote و Hold دارای TTL هستند، اما وضعیت business آن‌ها نیز جداگانه نگهداری می‌شود تا audit و عیب‌یابی ممکن باشد.
- `bookingRevision` روی Resource فقط برای serialize کردن رقابت تراکنش‌هاست و بخشی از قرارداد عمومی Resource نیست.
- هنگام resolve سیاست لغو، Club بر Organization اولویت دارد. Rule انتخاب‌شده، نسخه سیاست، زمان محاسبه، جریمه و مبلغ قابل بازپرداخت در cancellation snapshot نگهداری می‌شوند.
- لغو یک رزرو پرداخت‌شده یک سند واحد می‌سازد: بدهکار کردن escrow به مبلغ کل، بستانکار کردن Wallet به مبلغ بازپرداخت و بستانکار کردن حساب درآمد جریمه Organization.
- Payment زمان `expiresAt` مستقل دارد؛ TTL سند را حذف نمی‌کند و Worker lifecycle تجاری را به `expired` می‌برد تا تاریخچه مالی حفظ شود.
- `AccessPass.tokenHash` تنها داده ذخیره‌شده است. token خام پس از پاسخ صدور قابل بازیابی نیست و unique بودن `accessPassId` در CheckIn مانع replay می‌شود.
- NotificationJob با `dedupeKey` یکتا و delivery attempts مستقل از Outbox نگهداری می‌شود.
- token دستگاه فقط در Backend/Worker خوانده می‌شود و API فهرست دستگاه آن را projection می‌کند.

## Status

برای Lifecycle از `status` استفاده می‌شود، نه چند Boolean متناقض. Boolean فقط برای ویژگی مستقل و واقعی مجاز است.

وضعیت‌های مالی و رزروی دارای Domain Guard ثابت هستند؛ ادمین می‌تواند Label و Transition مجاز را پیکربندی کند ولی نمی‌تواند Invariant مالی را دور بزند.

## حذف داده

- داده محتوایی: `status = archived`.
- داده مالی، Audit و History: Append-only.
- درخواست حذف حساب: فرایند مستقل Anonymization با رعایت نگهداری داده‌های الزامی.
