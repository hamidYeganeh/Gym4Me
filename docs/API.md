# قرارداد API

Base URL:

```text
/api/v1
```

## قرارداد پاسخ

```json
{
  "data": {},
  "meta": {
    "request_id": "019...",
    "timestamp": "2026-08-31T10:00:00.000Z"
  }
}
```

خطا:

```json
{
  "error": {
    "code": "BOOKING_CAPACITY_EXCEEDED",
    "message": "ظرفیت این سانس تکمیل شده است.",
    "details": {},
    "request_id": "019..."
  }
}
```

## Headerها

```text
Authorization: Bearer <access-token>
Idempotency-Key: <uuid>
X-Request-Id: <uuid>
```

## Account

```text
POST /account/auth/otp/request
POST /account/auth/otp/verify
POST /account/auth/password/login
POST /account/auth/password/recovery/request
POST /account/auth/password/recovery/verify
POST /account/auth/password/recovery/reset
POST /account/auth/token/refresh
POST /account/auth/logout
POST /account/auth/logout-all

GET   /account/profile/me
PATCH /account/profile/me
POST  /account/security/password/set
POST  /account/security/password/change
GET   /account/security/sessions
DELETE /account/security/sessions/:sessionId

GET  /account/access-context
POST /account/access-context/activate
```

## Meta و داده داینامیک

```text
GET /meta/entities/:entityType/schema
GET /meta/forms/:formCode
GET /meta/taxonomies/:taxonomyCode/terms
```

## دامنه‌های اصلی

```text
POST   /organizations
GET    /organizations
GET    /organizations/:organizationId
PATCH  /organizations/:organizationId
POST   /organizations/:organizationId/submit
DELETE /organizations/:organizationId

POST   /clubs
GET    /organizations/:organizationId/clubs
GET    /clubs/:clubId
PATCH  /clubs/:clubId
POST   /clubs/:clubId/submit
DELETE /clubs/:clubId

POST   /clubs/:clubId/branches
GET    /clubs/:clubId/branches
GET    /branches/:branchId
PATCH  /branches/:branchId
PUT    /branches/:branchId/working-hours
POST   /branches/:branchId/holidays
DELETE /branches/:branchId/holidays/:holidayId
DELETE /branches/:branchId

POST   /branches/:branchId/resources
GET    /branches/:branchId/resources
GET    /resources/:resourceId
PATCH  /resources/:resourceId
DELETE /resources/:resourceId

POST   /organizations/:organizationId/offerings
GET    /branches/:branchId/offerings
GET    /offerings/:offeringId
PATCH  /offerings/:offeringId
DELETE /offerings/:offeringId

GET    /resources/:resourceId/availability/rules
POST   /resources/:resourceId/availability/rules
PATCH  /availability/rules/:ruleId
DELETE /availability/rules/:ruleId
GET    /resources/:resourceId/availability/exceptions
POST   /resources/:resourceId/availability/exceptions
PATCH  /availability/exceptions/:exceptionId
DELETE /availability/exceptions/:exceptionId
GET    /resources/:resourceId/availability/slots

GET /catalog/branches/:branchId/resources
GET /catalog/branches/:branchId/offerings
GET /catalog/resources/:resourceId/availability/slots

POST /bookings/quotes
GET  /bookings/quotes/:quoteId
POST /bookings/holds
POST /bookings/checkout
GET  /bookings/me
GET  /bookings/:bookingId
GET  /bookings/:bookingId/cancellation-preview
POST /bookings/:bookingId/cancel
POST /bookings/:bookingId/reschedule
POST /bookings/:bookingId/access-passes
POST /bookings/waitlist
GET  /bookings/waitlist/me
DELETE /bookings/waitlist/:entryId
POST /bookings/waitlist/:entryId/claim

GET    /bookings/household
PATCH  /bookings/household
POST   /bookings/household/members
DELETE /bookings/household/members/:memberId

GET  /finance/wallet/me
GET  /finance/payments/me
GET  /finance/invoices/me
GET  /finance/refunds/me
POST /finance/wallet/me/top-ups
GET  /finance/mock-gateway/payments/:paymentId
POST /finance/mock-gateway/payments/:paymentId/decision

GET    /organizations/:organizationId/cancellation-policies
POST   /organizations/:organizationId/cancellation-policies
GET    /clubs/:clubId/cancellation-policies
POST   /clubs/:clubId/cancellation-policies
PATCH  /cancellation-policies/:policyId
DELETE /cancellation-policies/:policyId

GET  /branches/:branchId/bookings
POST /branches/:branchId/bookings
POST /branches/:branchId/bookings/:bookingId/reschedule
POST /branches/:branchId/bookings/:bookingId/cancel
POST /branches/:branchId/access/check-ins
POST /branches/:branchId/access/check-outs/:checkInId
GET  /admin/bookings
POST /admin/bookings/:bookingId/cancel

GET    /organizations/:organizationId/members
GET    /organizations/:organizationId/invitations
POST   /organizations/:organizationId/invitations
DELETE /organizations/:organizationId/invitations/:invitationId
PATCH  /organizations/:organizationId/members/:memberId/status
POST   /organization-invitations/accept
GET    /branches/:branchId/staff

GET   /admin/organizations
POST  /admin/organizations
PATCH /admin/organizations/:organizationId
GET   /admin/clubs
POST  /admin/clubs
PATCH /admin/clubs/:clubId
GET   /admin/branches
POST  /admin/clubs/:clubId/branches
PATCH /admin/branches/:branchId
PATCH /admin/organizations/:organizationId/status
PATCH /admin/branches/:branchId/status
PATCH /admin/clubs/:clubId/verification
GET   /admin/catalog/resources
GET   /admin/catalog/offerings
PATCH /admin/catalog/resources/:resourceId/status
PATCH /admin/catalog/offerings/:offeringId/status

GET  /memberships/eligible
GET  /memberships/me
POST /memberships/products/:productId/purchase
GET  /catalog/organizations/:organizationId/memberships
GET  /organizations/:organizationId/memberships/products
GET  /organizations/:organizationId/memberships/contracts

GET   /coaching/me
POST  /coaching/relationships
PATCH /coaching/relationships/:relationshipId/status
PATCH /coaching/relationships/:relationshipId
GET   /coaching/relationships/:relationshipId/messages
POST  /coaching/relationships/:relationshipId/messages

GET    /admin/access/users
POST   /admin/access/users
PATCH  /admin/access/users/:userId
GET    /admin/access/permissions
GET    /admin/access/roles
POST   /admin/access/roles
PATCH  /admin/access/roles/:roleId
POST   /admin/access/assignments
DELETE /admin/access/assignments/:assignmentId
POST   /admin/access/users/:userId/impersonate

GET /organizations/:organizationId/finance/summary
GET /admin/finance/summary

GET   /organizations/:organizationId/finance/commission-rules
POST  /organizations/:organizationId/finance/commission-rules
PATCH /organizations/:organizationId/finance/commission-rules/:ruleId
GET   /organizations/:organizationId/finance/tax-rules
POST  /organizations/:organizationId/finance/tax-rules
PATCH /organizations/:organizationId/finance/tax-rules/:ruleId
GET   /organizations/:organizationId/finance/settlements
POST  /organizations/:organizationId/finance/settlements
GET   /organizations/:organizationId/finance/invoices
GET   /organizations/:organizationId/finance/refunds
GET   /organizations/:organizationId/finance/reconciliation

GET  /admin/finance/ledger
GET  /admin/finance/settlements
POST /admin/finance/settlements/:settlementId/pay
POST /admin/finance/refunds
POST /admin/finance/ledger/:transactionId/reverse

POST  /uploads
GET   /uploads/:assetId/content

GET   /notifications/me
PATCH /notifications/:notificationId/read
POST  /notifications/me/read-all
GET   /notifications/preferences/me
PATCH /notifications/preferences/me
GET   /notifications/devices/me
POST  /notifications/devices/me
POST  /notifications/devices/:installationId/revoke

POST /organizations/:organizationId/memberships/corporate-accounts
GET  /organizations/:organizationId/memberships/corporate-accounts
POST /organizations/:organizationId/memberships/corporate-accounts/:accountId/members
POST /organizations/:organizationId/memberships/corporate-contracts
GET  /organizations/:organizationId/memberships/corporate-contracts
GET  /organizations/:organizationId/memberships/corporate-contracts/:contractId/enrollments
POST /organizations/:organizationId/memberships/corporate-contracts/:contractId/enrollments
POST /organizations/:organizationId/memberships/corporate-contracts/:contractId/enrollments/:enrollmentId/end
POST /organizations/:organizationId/memberships/corporate-contracts/:contractId/renew
POST /organizations/:organizationId/memberships/corporate-contracts/:contractId/reset-budget
```

## قواعد

- Commandهای مالی و رزروی باید `Idempotency-Key` داشته باشند.
- پرداخت P0/P1 فقط از `sandbox_gateway` استفاده می‌کند. صفحه درگاه تستی فقط تصمیم `approve` یا `cancel` را به endpoint تصمیم می‌فرستد؛ اتصال بیرونی یا callback بانکی وجود ندارد.
- تصمیم درگاه با Payment سمت سرور تطبیق داده می‌شود و ثبت Paid/Cancelled، Ledger، Booking یا Membership، Invoice و Outbox داخل transaction انجام می‌شود.
- تاریخ‌ها ISO-8601 و در Storage به UTC هستند.
- مبلغ `amount_minor` عدد صحیح به همراه `currency` است.
- مالیات در زمان Quote از فعال‌ترین قانون با اولویت Offering سپس Branch سپس Organization محاسبه و snapshot می‌شود.
- Ledger و Audit قابل ویرایش نیستند؛ اصلاح مالی فقط با Refund یا Reversal/Compensating Transaction جدید انجام می‌شود.
- فایل verification به‌صورت private ذخیره می‌شود و دریافت محتوای آن به Bearer token و Scope معتبر نیاز دارد.
- Pagination مدیریتی فعلی با `page` و `limit` انجام می‌شود؛ APIهای Feed و Discovery در آینده Cursor خواهند داشت.
- جست‌وجوی Slot حداکثر ۳۱ روز است و `from` و `to` را به ISO-8601 دریافت می‌کند؛ زمان‌بندی با timezone سازمان و ذخیره UTC انجام می‌شود.
- Slotها فعلاً on-demand materialize می‌شوند و ظرفیت رزروهای `pending_payment`، `confirmed` و `checked_in` را کسر می‌کنند.
- `Quote` ده دقیقه اعتبار دارد؛ `Hold` ظرفیت را تا پایان همین بازه نگه می‌دارد و token خام آن فقط در پاسخ ساخت Hold برگردانده می‌شود.
- رزرو دوره‌ای در قالب `BookingSeries` و چند `Booking` مستقل ذخیره می‌شود تا لغو، حضور و بازپرداخت هر جلسه مستقل باشد.
- پرداخت با عضویت فقط پس از تطبیق Organization، Branch، Sport، Offering و ذی‌نفعان انجام می‌شود؛ اعتبار در Checkout رزرو، در Check-in مصرف و در لغو آزاد می‌شود.
- پرداخت `sandbox_gateway` عملیات واقعی بیرونی انجام نمی‌دهد. کاربر در صفحه درگاه تستی فقط «تأیید» یا «لغو» را انتخاب می‌کند و نتیجه نهایی دوباره از API خوانده می‌شود.
- سیاست فعال Club بر سیاست Organization اولویت دارد. Ruleها بر اساس `minimum_hours_before` نزولی بررسی می‌شوند و اولین threshold معتبر انتخاب می‌شود.
- مبلغ جریمه و بازپرداخت در لحظه لغو دوباره محاسبه و به‌صورت snapshot داخل Booking و Refund ثبت می‌شود؛ نتیجه نهایی همیشه از Ledger تراز عبور می‌کند.
- پرداخت درگاه ۱۵ دقیقه مهلت دارد. Worker پرداخت منقضی را `expired`، رزروهای وابسته را لغو و ظرفیت را آزاد می‌کند.
- Access Pass هر شرکت‌کننده token تصادفی هش‌شده، بازه اعتبار و lifecycle مستقل دارد؛ token خام فقط هنگام صدور بازگردانده و پس از نخستین ورود غیرقابل استفاده می‌شود.
- جابه‌جایی رزرو با قفل مجدد تمام Resourceها انجام و Access Passهای صادرشده قبلی باطل می‌شود.
- لغو پرسنل حالت `apply` دارد؛ فقط دارنده Permission مخصوص override می‌تواند `waive` یا `custom` را انتخاب کند و تمام تغییرات Audit می‌شوند.
- لیست انتظار FIFO است؛ Worker پس از آزادشدن ظرفیت، اولین درخواست‌های قابل پذیرش را برای ۳۰ دقیقه به وضعیت `offered` می‌برد و اعلان می‌سازد.
- مسیرهای Admin فقط با Permissionهای `admin.*` قابل دسترسی هستند.
