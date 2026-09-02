# RBAC، Scope و سیاست دسترسی

## مدل

```text
User
└── RoleAssignment
    ├── Role
    ├── ScopeType
    └── ScopeId

Role
└── RolePermission
    └── Permission
```

Scopeها:

```text
global
self
organization
branch
```

## Permission naming

```text
account.profile.read.self
coach.schedule.manage.self
branch.booking.create
branch.booking.cancel
branch.booking.reschedule
branch.booking.override-cancellation
branch.check-in.create
branch.check-out.create
organization.finance.read
admin.users.manage
admin.finance.refund
```

## اپ موبایل

- Athlete و Coach Persona
- Role Switcher
- Active Context از API دریافت و فعال می‌شود.

## پنل باشگاه

- مالک نقش‌های سفارشی می‌سازد.
- Permissionها فقط از Catalog سازمانی قابل انتخاب‌اند.
- پرسنل به Organization یا Branch مشخص Scope می‌شوند.
- نقش سفارشی باشگاه نمی‌تواند `admin.*` دریافت کند.

## پنل ادمین

- Super Admin مجوز `*` در Scope سراسری دارد.
- نقش‌های تفکیک‌شده برای مالی، تأیید، کاربران، محتوا و پشتیبانی وجود دارد.
- عملیات حساس نیازمند Reason، Step-up و Audit هستند.
- پذیرش می‌تواند رزرو بسازد، جابه‌جا کند، لغو عادی و ورود/خروج ثبت کند؛ بخشودگی یا جریمه سفارشی فقط برای مدیر شعبه/مالک با `branch.booking.override-cancellation` فعال است.

## Active Context

```text
GET  /api/v1/account/access-context
POST /api/v1/account/access-context/activate
```

Token جدید شامل Persona و Scope فعال است. Backend علاوه بر Token، مالکیت Resource و Scope واقعی آن را نیز بررسی می‌کند.

## Deny by default

اگر Permission صریح و Scope معتبر وجود نداشته باشد، دسترسی رد می‌شود. نمایش یا مخفی‌کردن منو در Frontend صرفاً تجربه کاربری است و جای Guard بک‌اند را نمی‌گیرد.
