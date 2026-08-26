# ADR-0002 — Trial، عضویت خانوادگی و اعتبار سازمانی

- **وضعیت:** `PROPOSED` — هنوز تصمیم محصول نیست
- **تاریخ پیشنهاد:** ۲۰۲۶-۰۸-۲۶
- **مالک تصمیم:** Product + Legal/Privacy + Finance + Backend
- **دامنه:** `ClubMembershipPlan` / `ClubMembership`؛ اشتراک پلتفرم جدا می‌ماند
- **استوری/سناریو:** G4M-MKT-03، family/guardian، corporate credit، trial conversion

## زمینه و تعارض فعلی

صفحه‌های `/athlete/family`، `/athlete/passes` و `/owner/family-memberships` فعلاً fixture هستند و schema/DTO/endpoint اجرایی متناظر ندارند. تصمیم‌های قفل‌شده فقط جدایی عضویت باشگاه و اشتراک پلتفرم، Ledger immutable، privacy و authorization مبتنی بر `activeRole` را تعیین کرده‌اند؛ مالکیت guardian، مسئولیت sponsor و semantics اعتبار سازمانی هنوز قفل نشده است.

پیاده‌سازی پیش از تصمیم می‌تواند بدهی را به شخص اشتباه، دسترسی سلامت کودک را به guardian بدون consent یا credit سازمانی را خارج از Ledger منتسب کند؛ بنابراین این ADR باید پیش از vertical slice تأیید شود.

## تصمیم پیشنهادی

### ۱. Trial

- Trial یک `ClubMembershipPlan` نسخه‌دار با `kind=trial` است، نه کوپن و نه اشتراک پلتفرم.
- محدودیت claim بر اساس `clubId + athleteUserId + policyVersion` سمت سرور enforce می‌شود.
- claim نیازمند حساب Athlete است؛ lead مهمان پس از OTP با phone normalized merge می‌شود.
- trial رایگان Payment/Ledger ساختگی نمی‌سازد؛ trial پولی از checkout استاندارد عضویت استفاده می‌کند.
- attribution شامل source/campaign/leadId و بدون PII در analytics ثبت می‌شود.

### ۲. Family و guardian

- هر فرد دارای `User` و `AthleteProfile` مستقل است؛ یک عضویت مشترک هرگز privacy profileها را ادغام نمی‌کند.
- `FamilyGroup` فقط رابطه، payer و allocation عضویت را نگه می‌دارد.
- فرد زیر سن policy نیازمند `GuardianConsent` نسخه‌دار و قابل revoke است.
- guardian به‌صورت پیش‌فرض فقط خرید، تمدید و attendance summary را می‌بیند؛ metric، health sync، progress photo، meal plan و message نیازمند grant جدا و scope/time limit هستند.
- انتقال یا حذف guardian سابقه consent و مصرف عضویت را حذف نمی‌کند؛ AuditLog append-only باقی می‌ماند.

### ۳. Corporate

- سازمان sponsor است، نه owner حساب ورزشکار.
- `CorporateAgreement` سقف کل، بازه اعتبار، club/branchهای مجاز و policy eligibility را snapshot می‌کند.
- `CorporateCreditAllocation` سهم هر Athlete را نگه می‌دارد؛ reservation/consumption با fact idempotent انجام می‌شود.
- تعهد مالی sponsor و سهم پرداخت Athlete در Invoice به‌صورت line item جدا هستند؛ هر پرداخت واقعی Ledger double-entry مستقل دارد.
- credit مصرف‌نشده Wallet شخصی نیست، cash-out نمی‌شود و در expiry طبق قرارداد sponsor آزاد می‌شود.
- sponsor فقط aggregate بدون PII می‌بیند؛ مشاهده فردی نیازمند مبنای حقوقی و consent صریح است.

### ۴. Family payment و debt

- `payerUserId` از `holderUserId` جدا و روی checkout/invoice snapshot می‌شود.
- بدهی به payer یا sponsor قراردادی متصل می‌شود؛ به کودک یا holder صرفاً به‌علت استفاده منتسب نمی‌شود.
- refund به source tender برمی‌گردد و correction فقط Ledger reversal است.
- mixed/partial payment همان policy فروش پذیرش موجود را reuse می‌کند؛ قرارداد مالی موازی ساخته نمی‌شود.

## مدل و migration پیشنهادی

افزودن additive و بدون حذف قرارداد فعلی:

- `FamilyGroup`, `FamilyMember`, `GuardianConsent`؛
- `CorporateAgreement`, `CorporateCreditAllocation`, `CorporateCreditUsage`؛
- `kind`, `eligibilityPolicy`, `claimLimit` روی `ClubMembershipPlan`؛
- `payerUserId`, `beneficiaryUserId`, `sponsorAgreementId`, `attribution` روی checkout/view modelهای مرتبط.

همهٔ collectionهای consumption دارای unique idempotency boundary و indexes bounded-list باشند. هیچ migrationی عضویت باشگاه را به `PlatformSubscription` تبدیل نمی‌کند.

## گزینه‌های نیازمند تأیید صریح

1. سن پیش‌فرض نیاز به guardian: **۱۸ سال** یا policy قابل تنظیم club با کف قانونی سراسری؟
2. آیا sponsor مجاز به دیدن attendance فردی است یا فقط aggregate ناشناس؟ پیشنهاد: فقط aggregate.
3. مسئول debt در mixed corporate payment: sponsor تا سقف تعهد و Athlete برای remainder؟ پیشنهاد: بله، با دو line item مستقل.
4. family allocation: pool مشترک یا سهم ثابت per-member؟ پیشنهاد: هر دو، ولی plan باید یکی را نسخه‌دار انتخاب کند.
5. trial uniqueness: یک‌بار در هر club یا branch؟ پیشنهاد: club-level برای جلوگیری از سوءاستفاده.

## معیار پذیرش

1. retry/race trial فقط یک claim و یک membership بسازد.
2. guardian revoke فوراً queryهای protected را ببندد و history را حفظ کند.
3. payer، holder و sponsor در Invoice/Ledger/Audit قابل تفکیک باشند.
4. دو مصرف هم‌زمان corporate بیش از allocation یا agreement limit موفق نشوند.
5. expiry اعتبار، Wallet شخصی یا Ledger correction ساختگی ایجاد نکند.
6. family/corporate/trial در empty/error هیچ fixture production نشان ندهند.
7. همه تاریخ‌ها ISO/UTC transport و Jalali/Tehran display داشته باشند.
8. consent، مالی، mutation و اعلان در transaction/Outbox مناسب و idempotent باشند.

## اثر تصویب

پس از `ACCEPTED` شدن، `G4M-MKT-03` از مانع تصمیمی خارج می‌شود؛ dependencyهای `G4M-012/031/050` و تست‌های integration/device همچنان مستقل بررسی می‌شوند. تا پیش از تصویب، routeهای fixture نباید به‌عنوان feature پیاده‌شده یا production-ready معرفی شوند.
