# Gym4Me — Growth و Lifecycle Marketing

این سند جهت‌گیری acquisition، activation، retention و expansion را تعریف می‌کند. موارد پیشنهادی تا انتقال به `decisions.md` تصمیم قفل‌شده نیستند.

## تز رشد

Gym4Me می‌تواند هم SaaS باشگاه، هم marketplace، ابزار مربی و اپ ورزشکار باشد؛ اما ساخت هم‌زمان همهٔ این‌ها ریسک تمرکز و cold-start را بالا می‌برد.

**wedge پیشنهادی:**

> سیستم عضویت، حضور و تمدید باشگاه با تجربهٔ موبایل برای عضو

حلقهٔ اولیه:

```text
باشگاه onboard می‌شود
→ اعضای موجود را import می‌کند
→ عضو برای عضویت/QR فعال می‌شود
→ حضور و تمدید در Gym4Me ثبت می‌شود
→ ریسک ریزش قابل تشخیص می‌شود
→ باشگاه lifecycle campaign اجرا می‌کند
→ درآمد و referral رشد می‌کند
```

این رویکرد عرضهٔ کاربران marketplace را از شبکهٔ اعضای فعلی باشگاه‌ها تأمین می‌کند.

## North Star و KPIها

### North Star

- قبل از پرداخت کامل: **Weekly Successful Check-ins**
- پس از فعال‌شدن جریان مالی: **Weekly Paid Active Members**

### شاخص‌های اصلی

| حوزه | KPI |
|------|-----|
| Acquisition | visitor→OTP، signup completion، CAC بر اساس کانال، سهم referral |
| Activation باشگاه | زمان تا ساخت شعبه، import اولین عضو و اولین دریافت وجه |
| Activation مربی | زمان تا انتشار خدمت و اولین شاگرد پولی |
| Activation ورزشکار | زمان تا اولین حضور یا رزرو |
| Retention | D30، show-up rate، دفعات حضور، renewal rate |
| Revenue | GMV، MRR، ARPU، take rate، payment success |
| Expansion | free→paid، plan upgrade، attach rate خدمات جانبی |
| Churn | logo churn باشگاه، عضویت منقضی بدون تمدید، مربی غیرفعال |
| Referral | invite rate، invite→join، reward cost و K-factor |

تعریف KPI باید شامل event، actor، tenant، بازه زمانی و timezone باشد.

## Lifecycleهای ورزشکار

| Trigger | شرط/زمان | اقدام پیشنهادی | KPI |
|---------|----------|---------------|-----|
| ثبت‌نام ناقص | ۱ ساعت / ۱ روز | deep link ادامه onboarding | profile completion |
| مشاهده بدون خرید | مشاهده باشگاه/مربی بدون رزرو | reminder محدود یا محتوای اعتمادساز | view→booking |
| پرداخت ناقص | booking در `AWAITING_PAYMENT` | یادآوری قبل از TTL؛ سپس آزادسازی ظرفیت | payment recovery |
| جلسه نزدیک | ۲۴ و ۲ ساعت قبل | push؛ SMS fallback برای پیام حیاتی | show-up |
| اولین حضور | پس از `CHECKED_IN` | راهنمای قدم بعدی و درخواست preference | second visit |
| عدم مراجعه | ۷/۱۴ روز بدون check-in | پیام بازگشت متناسب با سابقه | reactivation |
| اعتبار کم | جلسات یا روزهای باقی‌مانده زیر threshold | CTA تمدید با قیمت شفاف | renewal |
| انقضا نزدیک | ۷/۳/۱ روز | reminder با frequency cap | renewal |
| انقضا | ۱/۷/۱۴ روز بعد | win-back بدون تخفیف پیش‌فرض | win-back |
| no-show تکراری | ۲ یا ۳ بار | بررسی مانع و تغییر زمان؛ نه spam تخفیف | no-show recovery |

## Lifecycleهای باشگاه

- ثبت‌نام بدون ساخت شعبه → onboarding task و کمک انسانی.
- شعبه بدون پلن/منبع قابل فروش → checklist راه‌اندازی.
- بدون import عضو → template CSV و راهنمای mapping.
- بدون اولین تراکنش → بررسی تنظیم پرداخت/صندوق.
- کاهش اعضای فعال یا GMV → هشدار سلامت حساب برای Customer Success.
- استفاده پایین پرسنل → آموزش نقش‌محور.
- نزدیک‌شدن به limit پلن → upsell در لحظهٔ دریافت ارزش.
- انقضای اشتراک → grace و read-only؛ داده حذف نمی‌شود.

## Lifecycleهای مربی

- تأیید شده ولی خدمت یا availability ندارد.
- خدمت منتشر شده ولی رزرو ندارد.
- لید بدون پاسخ یا trial بدون follow-up.
- شاگرد بدون workout log یا افت پایبندی.
- ظرفیت شاگرد یا درآمد نزدیک limit پلن.
- تسویه آماده یا dispute باز.

## اولویت Push در محصول

1. **تراکنشی و فوری:** نتیجه پرداخت، تأیید/رد/لغو یا جابه‌جایی رزرو، offer صف انتظار و تغییر عضویت. همیشه inbox نیز ثبت شود؛ SMS فقط fallback رویداد حیاتی باشد.
2. **یادآوری زمان‌دار:** جلسه در ۲۴ و ۲ ساعت آینده، مهلت پرداخت و پایان offer. با انجام action یا تغییر وضعیت، پیام زمان‌بندی‌شده لغو شود.
3. **تمدید و نگهداشت:** اعتبار کم، انقضای ۷/۳/۱ روزه و عدم مراجعهٔ ۷/۱۴ روزه؛ تابع consent، quiet hours و frequency cap باشد.
4. **مربی و مالک:** رزرو نیازمند پاسخ، لید بدون follow-up، تسویه آماده، dispute باز و کارهای ناقص onboarding؛ به actor مسئول و club درست محدود شود.
5. **کم‌اولویت/اختیاری:** دستاورد، referral و محتوای بازگشت. این گروه marketing است و opt-out مستقل، holdout و KPI conversion می‌خواهد.

Push برای OTP، رسید دائمی، داده سلامت/KYC یا پیام خصوصی کامل منبع حقیقت نیست؛ OTP با SMS، رسید با inbox و محتوای حساس با متن حداقلی و deep link احراز‌شده ارائه شود.

## Referral

قابلیت فعلی کد معرف باید با این الزامات کامل شود:

- لینک و deep link اشتراک‌پذیر مانند `/r/{code}`.
- پاداش دوطرفه بعد از event معتبر مانند اولین پرداخت یا اولین check-in.
- Ledger برای هر reward مالی.
- محدودیت device/phone/payment instrument و velocity برای ضدتقلب.
- clawback در refund یا fraud.
- campaign و reward version برای اندازه‌گیری cohort.
- UI دعوت، وضعیت دعوت و دلیل رد پاداش.

## Retention playbook برای باشگاه

Segmentهای اولیه rule-based:

1. عضویت با انقضای حداکثر ۷ روز.
2. حداکثر ۳ جلسه باقی‌مانده.
3. بدون check-in در ۱۴ روز.
4. پرداخت ناقص.
5. trial بدون تبدیل.
6. no-show تکراری.
7. عضو جدید بدون حضور دوم.

هر playbook باید owner، هدف، کانال، frequency cap، holdout و success metric داشته باشد.

## معماری داده و الزامات فنی

### P0 — اندازه‌گیری و تحویل قابل‌اعتماد

#### Event taxonomy

حداقل eventهای server-side:

```text
user_registered
profile_completed
club_published
members_imported
club_viewed
booking_started
booking_confirmed
payment_succeeded
payment_failed
checked_in
no_show_recorded
membership_started
membership_renewed
membership_expired
referral_invite_sent
referral_qualified
subscription_upgraded
```

هر event شامل این envelope است:

- `eventId`, `eventName`, `occurredAt`, `schemaVersion`
- `actorUserId`, `activeRole`, `clubId/tenantId`
- `source`, `platform`, `locale`, `timezone`
- `correlationId` برای اتصال booking/payment/notification
- properties فاقد دادهٔ سلامت یا متن حساس مگر با ضرورت و policy روشن

#### Attribution

- first-touch و last-touch جداگانه.
- UTM، referrer، landing page، referral/affiliate و deep-link source.
- attribution اولیه write-once؛ attribution تبدیل قابل محاسبه مجدد.
- referral (`referralCode` / `referredBy`) روی همان مدل User در MongoDB نگه داشته می‌شود.

#### Delivery

- Transactional Outbox برای event/notification پس از commit دامنه.
- consumer idempotent و retry با backoff.
- deduplication برای payment، reward و notification.
- dead-letter handling و observability.
- پیام تراکنشی از پیام بازاریابی جدا باشد.

#### Consent و preference

- opt-in/opt-out هر کانال، purpose و timestamp.
- quiet hours، زبان و timezone.
- SMS حیاتی فقط برای رویدادهای تعریف‌شده.
- suppression list و frequency cap سراسری و per-campaign.

### P1 — segmentation و آزمایش

- Segment engine rule-based بر اساس event و snapshot دامنه.
- Journey scheduler با state، delay، cancel condition و conversion goal.
- template versioning و approval برای SMS/push/in-app.
- holdout و A/B test با assignment پایدار.
- feature flag و rollout cohort-based.
- dashboard funnel بر اساس persona، club و acquisition source.
- export کنترل‌شده CSV برای عملیات باشگاه.

### Churn scoring

در شروع از rule استفاده شود، نه ML:

```text
risk =
  days_since_last_checkin
  + remaining_credits
  + days_to_expiry
  + recent_no_shows
  + failed_payments
  + unresolved_support
```

وزن‌ها باید با دادهٔ واقعی validate شوند و score به‌تنهایی موجب پیام یا محدودیت حساس نشود.

## کانال‌ها در ایران

| کانال | کاربرد |
|-------|--------|
| In-app | inbox دائمی، رسید و وضعیت |
| Push | reminder و engagement کم‌هزینه |
| SMS/کاوه‌نگار | OTP و fallback پیام حیاتی |
| Email | رسید، گزارش و ارتباط B2B در صورت وجود ایمیل معتبر |
| WhatsApp/Telegram | فقط پس از بررسی حقوقی، provider رسمی، consent و امکان opt-out |

پیام‌رسان‌ها نباید وابستگی P0 باشند.

## اولویت تحویل

### P0

1. اتصال mobile به auth و referral deep link.
2. CTA واقعی وب‌سایت به signup/lead.
3. event envelope، attribution و server-side events.
4. اولین checkout زرین‌پال + پرداخت حضوری + Ledger.
5. اعلان تراکنشی رزرو، پرداخت، حضور و تمدید.
6. lifecycle انقضا و پرداخت ناقص.
7. UI referral و reward سادهٔ ضدتقلب.

### P1

1. صفحات SEO باشگاه/مربی/شهر.
2. Segment و campaign ساده برای مالک.
3. health dashboard باشگاه و اعضای در معرض ریزش.
4. paywall و upgrade مربی/باشگاه.
5. A/B و holdout.

### P2

- کانال‌های پیام‌رسان.
- personalization پیشرفته.
- مدل ML churn.
- growth loop شبکه اجتماعی.

## Guardrailها

- تخفیف نباید جایگزین حل مشکل تجربه یا کیفیت شود.
- دادهٔ سلامت، KYC و پیام خصوصی برای segmentation بازاریابی استفاده نشوند.
- معیارهای vanity مانند تعداد نصب، به‌تنهایی معیار موفقیت نیستند.
- هیچ campaign بدون opt-out، frequency cap و اندازه‌گیری conversion منتشر نشود.
- هر قابلیت growth باید اثر خود بر باشگاه، مربی و ورزشکار را جداگانه گزارش کند.
