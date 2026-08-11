# Gym4Me — معماری سرویس‌های مالک باشگاه و مربی

این سند معماری فنی سرویس‌های دو پرسونای `owner` و `coach` را بر اساس تصمیم‌های قفل‌شدهٔ [`decisions.md`](./decisions.md) و نیازهای [`market-requirements.md`](./market-requirements.md) مشخص می‌کند. رانتایم دامنه MongoDB/Mongoose در `apps/api/src/schemas` است و `apps/api` تنها منبع حقیقت است.

## ۱. اصول حاکم (غیرقابل‌مذاکره)

- مجوزدهی فقط از `activeRole` در JWT خوانده می‌شود؛ `roles` فقط برای سوئیچر UI است.
- دسترسی پرسنل باشگاه با grant per-staff از کلیدهای `PermissionDefinition` است؛ نقش‌های آماده فقط preset هستند.
- هر جهش مالی، رکورد double-entry تغییرناپذیر در Ledger می‌نویسد؛ `Wallet.balance` فقط cache مشتق‌شده است.
- hold ظرفیت، callback درگاه، پاداش و اعلان‌ها idempotent هستند.
- هر منبع رزروپذیر (فضا، سانس، مربی، کلاس) تقویم و ظرفیت مستقل دارد.
- اشتراک پلتفرم (`PlatformPlan/PlatformSubscription`) و عضویت باشگاه (`ClubMembershipPlan/ClubMembership`) دو دامنهٔ جدا هستند.
- شکل مدل‌ها: enum/status به‌جای boolean؛ فیلدهای هم‌خانواده تو در تو (`domain-model-shape`).

## ۲. نقشهٔ کلی سرویس‌ها

```text
apps/api/src/
  account/            # سرویس‌های نقش‌محور کاربر لاگین‌شده (activeRole-aware)
    auth/  profile/  kyc/  roles/  referral/
    clubs/            # مدیریت باشگاه توسط owner
    club-slots/       # سانس‌ها
    coaches/          # پروفایل حرفه‌ای مربی
    bookings/         # رزرو نقش‌محور (athlete/coach/owner/admin)
    memberships/      # پلن و عضویت باشگاه + اشتراک پلتفرم
    staff/            # پرسنل و مجوز per-staff
    coaching/         # خدمات، بسته، شاگرد، لید، health assessment
    calendar/         # بلاک تقویم باشگاه/مربی
  finance/            # Ledger، کیف پول، پرداخت، تسویه، صندوق، بدهی
  checkin/            # حضور QR/دستی + sync آفلاین
  waitlist/           # صف انتظار با offer زمان‌دار
  progress/           # بانک حرکت، برنامه تمرین، متریک، عکس پیشرفت
  nutrition/          # meal plan
  social/             # پست/کامنت/لایک
  notifications/      # template تراکنشی + inbox + SMS fallback
  banners/  articles/  gamification/  support/
  admin/  basics/  media/  analytics/  audit/
```

قاعدهٔ مرزبندی: «چه کسی خدمت را عرضه می‌کند» در `account/*` است، «موتورهای مشترک بین نقش‌ها» (رزرو، مالی، اعلان) ماژول top-level هستند و هیچ منطق نقش‌محوری داخل خودشان ندارند — سیاست نقش/مجوز در Guard و سرویس فراخوان اعمال می‌شود.

## ۳. مدل‌های دامنه (Mongoose)

### ۳.۱ عرضهٔ باشگاه (owner — فاز ۲، بخشی موجود)

| Schema | نکات کلیدی شکل مدل |
|---|---|
| `Club` (موجود) | `status: 'draft'\|'pending'\|'published'\|'suspended'`؛ `contact: {...}`، `policies: {...}` تو در تو |
| `ClubBranch` | شعبه با `location`، `hours: { weekday, open, close }[]`، جنسیت/گروه سنی به‌صورت `admission: { gender, ageRange, levels }` |
| `ClubSpace` | فضا/زمین/سالن؛ `capacity`، `pricing: { base, currency }`، `availability: 'active'\|'maintenance'\|'retired'` |
| `ClubSlot` (موجود) | سانس با تقویم مستقل |
| `ClubClass` (موجود) | کلاس گروهی: `cohort`، `level`، `capacity`، مربی(ها) |
| `ClubDocument` | مدارک تأیید؛ `review: { status, reviewerId, reviewedAt, note }` |

### ۳.۲ عضویت باشگاه (فاز ۴)

| Schema | نکات |
|---|---|
| `ClubMembershipPlan` | `kind: 'duration'\|'sessions'\|'entries'`؛ `pricing: { amount, tax }`؛ `rules: { freezeMax, transferPolicy, guestPass }` |
| `ClubMembership` | `status: 'active'\|'frozen'\|'expired'\|'transferred'\|'cancelled'`؛ `credit: { remainingSessions?, remainingEntries?, expiresAt }`؛ `holder: { userId?, guest?: { name, phone } }` — فروش حضوری بدون اپ (OWN-IR-3) |
| `MembershipEvent` | تاریخچهٔ append-only فریز/انتقال/تمدید با `actor`، `reason` → جفت AuditLog |

### ۳.۳ رزرو و حضور (فاز ۳)

| Schema | نکات |
|---|---|
| `Booking` | `status: BookingStatus` (۱۰ حالته)؛ `resource: { type: 'space'\|'slot'\|'coach'\|'class', id }`؛ `recurringGroupId?`؛ `attendees[]` (رزرو همراه مربی) |
| `ResourceCalendarBlock` | بلاک تقویم هر منبع (تعطیلی، سرویس دوره‌ای، بلاک رزرو مربی) |
| `Waitlist` | `entries: { userId, priority, offeredAt?, offerExpiresAt? }[]` — offer زمان‌دار (OWN-IR-7) |
| `CheckIn` | `method: 'qr'\|'barcode'\|'manual'`؛ `sync: { mode: 'online'\|'offline', reconciledAt? }` با جلوگیری از مصرف تکراری (کلید idempotency) |

### ۳.۴ کسب‌وکار مربی (فاز ۲–۶)

| Schema | نکات |
|---|---|
| `CoachProfile` (موجود) | `verification: 'unsubmitted'\|'pending'\|'approved'\|'rejected'`؛ `credentials: { type, authority, expiresAt }[]` (P12/Q8) |
| `CoachClubAffiliation` | `type: 'independent'\|'employed'\|'revenue_share'`؛ per-branch؛ `contract: { sharePercent?, salary?, effectiveFrom, effectiveTo? }` (CCH-IR-1) |
| `CoachService` | خدمت قابل‌فروش: جلسه خصوصی حضوری/آنلاین/در منزل؛ `delivery: { mode, onlineProvider?, travel?: { radiusKm, fee } }` |
| `SessionPackage` | بسته جلسات: `sessions: { total, used }`؛ `validity: { expiresAt, freeze?: {...} }` (CCH-IR-2) |
| `CoachAvailability` | تقویم عملیاتی: `buffers: { beforeMin, afterMin }`؛ `locations[]`؛ `timeOff[]` (CCH-IR-3) |
| `CoachStudent` | رابطهٔ فعال مربی-شاگرد؛ مبنای دسترسی `COACH_ONLY` |
| `CoachLead` | `stage: 'new'\|'contacted'\|'trial'\|'converted'\|'lost'` (CCH-IR-8) |
| `HealthAssessment` | PAR-Q و محدودیت تمرین؛ پیش‌فرض `PRIVATE`، enforcement در API (CCH-IR-5) |

### ۳.۵ مالی مشترک (فاز ۳ و ۶)

| Schema | نکات |
|---|---|
| `LedgerEntry` | double-entry تغییرناپذیر؛ `split: { gross, discount, tax, providerShare, platformFee, gatewayFee, net }` |
| `Payment` | `channel: 'zarinpal'\|'cash'\|'pos'\|'card_to_card'\|'wallet'\|'mixed'`؛ `reference`، `operator` (OWN-IR-1) |
| `Debt` / `Installment` | مانده، سررسید، پرداخت جزئی؛ تاریخچهٔ غیرقابل‌حذف (OWN-IR-2) |
| `CashShift` | بستن صندوق: مغایرت به تفکیک کانال (OWN-IR-10) |
| `Payout` | تسویهٔ باشگاه/مربی؛ `dispute?: { status, reason }` (CCH-IR-7) |
| `CompensationRule` | فرمول حقوق/پورسانت: per-session / حضور / درصد فروش (OWN-IR-12) |

## ۴. سطح API (NestJS)

الگوی هر ماژول: `*.controller.ts` (نقش‌محور) + `*.service.ts` + DTOهای class-validator + Guard.

### ۴.۱ Guardها

```text
JwtAuthGuard → ActiveRoleGuard('owner'|'coach') → ClubScopeGuard → StaffPermissionGuard('finance.read', …)
```

- `ActiveRoleGuard` فقط `activeRole` را چک می‌کند.
- `ClubScopeGuard` مالکیت/عضویت staff روی `clubId` مسیر را تأیید می‌کند.
- `StaffPermissionGuard` فقط برای مسیرهای staff-enabled؛ owner همهٔ مجوزهای باشگاه خودش را implicit دارد.

### ۴.۲ سطح مسیرها (نمونه)

| گروه | مسیر | نقش |
|---|---|---|
| باشگاه | `POST /account/clubs` · `PATCH /account/clubs/:id` · `POST /account/clubs/:id/submit-review` | owner |
| منابع | `POST /account/clubs/:id/spaces` · `/slots` · `/classes` | owner/staff (`sessions.manage`) |
| عضویت | `POST /account/clubs/:id/membership-plans` · `POST /account/clubs/:id/memberships` (فروش حضوری) · `POST /memberships/:id/freeze` | owner/staff (`members.manage`) |
| پذیرش | `POST /booking/desk` (رزرو تلفنی/حضوری) · `POST /checkin` · `POST /checkin/sync` | staff (`bookings.create`, `members.checkin`) |
| مالی | `POST /finance/payments/manual` · `POST /finance/shifts/:id/close` · `GET /finance/payouts` | owner/staff (`finance.*`) |
| مربی | `PUT /account/coaches/profile` · `POST /account/coaches/services` · `PUT /account/coaches/availability` | coach |
| جلسات | `POST /booking/:id/confirm` · `/reject` · `/reschedule` · `POST /booking/:id/attendance` (حضور/تأخیر/no-show) | coach |
| بسته | `POST /account/coaching/packages` · `POST /packages/:id/consume` | coach |
| لید | `POST /account/coaching/leads` · `PATCH /leads/:id/stage` | coach |
| عمومی | `GET /discovery/clubs` · `GET /discovery/coaches` · `GET /discovery/coaches/:id` | بدون auth |

### ۴.۳ جریان‌های کلیدی

**رزرو → پرداخت → حضور (هستهٔ MVP):**

```text
create booking → hold ظرفیت (TTL, idempotent) → AWAITING_PAYMENT
→ Payment (زرین‌پال callback idempotent یا ثبت حضوری staff)
→ LedgerEntry (split کامل) → CONFIRMED → اعلان تراکنشی از template
→ check-in (QR / آفلاین با sync) → CHECKED_IN → COMPLETED
→ سهم مربی/باشگاه در Ledger → صف Payout
```

**تأیید مربی:** `CoachProfile.verification: unsubmitted → pending → approved/rejected` توسط ادمین با اعتبارسنجی `credentials[].authority/expiresAt`؛ فقط `approved` در discovery ایندکس می‌شود.

**لغو اضطراری/جایگزینی (P4/O7–O8):** جهش روی Booking + `MembershipEvent`/AuditLog + اعلان + در صورت اثر مالی، LedgerEntry معکوس — هرگز ویرایش درجا.

## ۵. سطح کلاینت (`@repo/api` + اپ‌ها)

هر دامنهٔ جدید طبق `api-package-structure` پنج‌فایلی است:

```text
packages/api/src/
  ownership/    clubs.* spaces.* memberships.* staff.* finance.*
  coaching/     profile.* services.* availability.* packages.* leads.* sessions.*
  booking/      bookings.* checkin.* waitlist.*
  discovery/    clubs.* coaches.*        # موجود/در حال گسترش
```

- `apps/mobile`: ماژول‌های `owner/` و `coach/` (screens/sections/lib) با سوئیچر نقش؛ فقط از هوک‌های `@repo/api/<domain>/hooks`. mock فعلی در `modules/discovery/lib/*-data.ts` باید بدون تغییر props عمومی با آداپتور API جایگزین شود.
- `apps/admin`: تأیید مدارک باشگاه/مربی، قوانین کمیسیون، تسویه، dispute.
- `apps/website`: صفحات SEO باشگاه/مربی/شهر فقط از `discovery` (خواندنی عمومی).

## ۶. مقاومت شبکه و ایران-market

- check-in آفلاین: صف local با idempotency key، sync دسته‌ای، رد مصرف تکراری سمت سرور.
- همهٔ تاریخ‌های کاربرمحور شمسی/هفتهٔ شنبه‌محور در کلاینت؛ ذخیره‌سازی UTC.
- SMS حیاتی (OTP، offer صف انتظار، یادآوری جلسه) با کاوه‌نگار پشت `SmsService` و fallback از push.
- پرداخت‌های حضوری (نقد/کارت‌خوان/کارت‌به‌کارت/ترکیبی) همان مسیر Ledger پرداخت آنلاین را می‌روند؛ فقط `channel` فرق دارد.

## ۷. نگاشت به فازها

| فاز | تحویل معماری |
|---|---|
| ۲ | `discovery`، `CoachClubAffiliation`، credential validation، `ClubSpace/Slot/Class` کامل |
| ۳ | `booking` + `finance` (Ledger/Payment) + `notifications` + `CoachAvailability` + attendance — هستهٔ MVP |
| ۴ | `memberships` + فروش حضوری + `SessionPackage` + فریز/انتقال با AuditLog |
| ۵ | برنامه تمرین/پیشرفت (Epic G/H) و `HealthAssessment` |
| ۶ | `staff` (grant per-staff)، `CashShift`، `Debt/Installment`، `Payout/CompensationRule`، `CoachLead` |

> موارد `market-requirements.md` تا انتقال به `decisions.md` پیشنهادی‌اند؛ این سند نحوهٔ پیاده‌سازی آن‌ها را در صورت تصویب تعیین می‌کند و تصمیم قفل‌شدهٔ جدیدی ایجاد نمی‌کند.
