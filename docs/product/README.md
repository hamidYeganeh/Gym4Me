# Gym4Me Product Docs

| سند | محتوا |
|-----|--------|
| [competitive-product-review-2026-08.md](./competitive-product-review-2026-08.md) | بررسی رقبا، ارزیابی کاربردی بودن محصول و backlog قابلیت‌های مناسب با معماری |
| [cursor-implementation-master-plan.md](./cursor-implementation-master-plan.md) | backlog اجرایی اولویت‌بندی‌شده برای تکمیل محصول توسط Cursor |
| [architecture-completion-guardrails.md](./architecture-completion-guardrails.md) | ADR و guardrailهای معماری، تراکنش، تست، امنیت و نگهداری |
| [prd-gym4me.md](./prd-gym4me.md) | PRD جامع محصول، شکاف‌ها، اولویت‌ها، KPI و معیار پذیرش |
| [architecture-mobile-api-delivery.md](./architecture-mobile-api-delivery.md) | معماری پیشنهادی Capacitor، متریک، API versioning و انتشار پویا |
| [decisions.md](./decisions.md) | تصمیمات قفل‌شدهٔ محصول و معماری |
| [phases.md](./phases.md) | فازبندی تحویل |
| [user-stories.md](./user-stories.md) | یوزر استوری‌ها بر اساس Epic |
| [scenarios.md](./scenarios.md) | سناریوهای end-to-end |
| [checklist.md](./checklist.md) | وضعیت پیاده‌سازی در هر اپ |
| [market-requirements.md](./market-requirements.md) | نیازهای بازار ایران از نگاه مالک، مربی و ورزشکار |
| [growth-lifecycle.md](./growth-lifecycle.md) | استراتژی Growth، lifecycle، retention و الزامات داده |
| [architecture-owner-coach.md](./architecture-owner-coach.md) | معماری فنی سرویس‌های مالک باشگاه و مربی |

## زمینهٔ خودکار Cursor

- Rule اجرای backlog: `.cursor/rules/gym4me-implementation-execution.mdc`
- Rule تصمیمات قفل‌شده: `.cursor/rules/product-decisions.mdc`
- Skill برنامه‌ریزی و ممیزی محصول: `.cursor/skills/gym4me-product-planning/SKILL.md`
- Skill Growth و lifecycle: `.cursor/skills/gym4me-growth-lifecycle/SKILL.md`

## سطح قطعیت اسناد

- `decisions.md`: تصمیم‌های تأییدشده و قفل‌شده.
- `user-stories.md` و `scenarios.md`: محدودهٔ محصول و رفتار مورد انتظار.
- `market-requirements.md` و `growth-lifecycle.md`: backlog و جهت‌گیری پیشنهادی؛ برای قفل‌شدن باید به `decisions.md` منتقل شوند.
- `architecture-owner-coach.md`: طرح پیاده‌سازی نیازهای پیشنهادی؛ تصمیم قفل‌شدهٔ جدید ایجاد نمی‌کند.
- `competitive-product-review-2026-08.md`: پیشنهاد بازار و backlog تکمیلی `G4M-MKT-*`؛ تصمیم قفل‌شده ایجاد نمی‌کند و جای P0 هسته را نمی‌گیرد.
- `prd-gym4me.md` و `architecture-mobile-api-delivery.md`: پیشنهاد برای تصویب؛ وضعیت «انجام‌شده» ایجاد نمی‌کنند و تصمیم قفل‌شدهٔ جدیدی نمی‌سازند.
- `checklist.md`: فقط وضعیت پیاده‌سازی است و نباید به‌عنوان مدرک تکمیل قابلیت استفاده شود مگر جریان end-to-end کار کند.
