---
name: gym4me-product-planning
description: Plans and reviews Gym4Me product requirements for Iranian clubs, coaches, athletes, staff, and admins. Use when changing product scope, user stories, Prisma domain models, delivery phases, end-to-end scenarios, or persona requirements.
---

# Gym4Me Product Planning

## Required context

Before planning or changing a product domain, read:

1. `docs/product/decisions.md`
2. `docs/product/user-stories.md`
3. `docs/product/scenarios.md`
4. `docs/product/checklist.md`
5. `docs/product/phases.md`
6. `docs/product/market-requirements.md`
7. Relevant models in `apps/api/prisma/schema.prisma`

Treat `decisions.md` as locked. Treat `market-requirements.md` as proposed until the user explicitly approves moving an item into decisions.

## Analysis workflow

1. Identify affected personas and active role.
2. Separate:
   - already implemented end-to-end;
   - schema/UI mock/API-only;
   - planned requirement;
   - genuinely missing requirement.
3. Check API, mobile, admin and website responsibilities.
4. Trace at least one happy path and key failure/recovery paths.
5. Assign P0/P1/P2 based on revenue, daily operations, retention and risk.
6. Map accepted work to user story, scenario, phase and checklist.

Do not report an existing schema model as an implemented feature.

## Product priorities

Prefer completion in this order:

1. Identity and role profiles.
2. Club supply and discovery.
3. Booking/payment/check-in with Ledger.
4. Membership/renewal/lifecycle.
5. Coaching/progress.
6. Advanced operations and analytics.
7. Social and nutrition after the core retention loop works.

Optimize for the loop:

```text
membership or booking → payment → attendance → repeat attendance → renewal
```

Avoid expanding social, nutrition or sport-specific models when a configuration/policy on shared resources is sufficient.

## Iran-market checklist

For relevant features, verify:

- Jalali UX, Saturday-first week and Iran timezone.
- Cash, POS, card-to-card, Zarinpal and mixed payments.
- IRR/IRT display and conversion boundaries.
- SMS fallback and poor-network behavior.
- Reception-assisted flows for users without the app.
- Gender, age, skill-level and branch policies.
- Installments, debt, refund, settlement and immutable audit trail.
- Parent/child consent and health-data privacy.
- Official invoice/tax implications when applicable.

## Non-negotiable domain rules

- Authorization uses JWT `activeRole`, not role membership alone.
- Staff authorization uses per-member permission grants.
- Financial mutations write immutable double-entry Ledger records.
- Capacity holds, callbacks, rewards and notifications are idempotent.
- Metrics, progress photos, meal plans and health data default to private.
- Platform subscriptions and club memberships remain separate domains.

## Required output

When proposing a requirement, include:

- persona and user value;
- P0/P1/P2;
- current evidence and implementation status;
- acceptance criteria;
- affected apps/models;
- edge cases and lifecycle events;
- whether it changes a locked decision.

When editing docs, keep `README.md`, user stories, scenarios, phases and checklist consistent.
