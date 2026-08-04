---
name: gym4me-growth-lifecycle
description: Designs and reviews Gym4Me acquisition, activation, retention, referral, lifecycle marketing, churn prevention, attribution, and expansion revenue. Use when implementing analytics events, campaigns, notifications, CRM, onboarding, subscriptions, referrals, SEO funnels, or growth dashboards.
---

# Gym4Me Growth and Lifecycle

## Required context

Read before making growth decisions:

1. `docs/product/growth-lifecycle.md`
2. `docs/product/market-requirements.md`
3. `docs/product/decisions.md`
4. `docs/product/user-stories.md`
5. `docs/product/checklist.md`
6. Relevant auth, booking, membership, payment and notification code

Distinguish repository evidence from assumptions or general growth advice.

## Strategy

Default wedge:

```text
club onboarding
→ member import
→ membership/check-in adoption
→ attendance data
→ renewal lifecycle
→ referral and expansion
```

Prioritize closed, measurable loops over isolated campaigns. Do not optimize install count or message volume as success metrics.

Use:

- **North Star before full payments:** Weekly Successful Check-ins.
- **North Star after payments:** Weekly Paid Active Members.

## Growth review workflow

For every feature or campaign:

1. Name the persona: club owner, coach or athlete.
2. Name the funnel stage: acquisition, activation, retention, referral, revenue or resurrection.
3. Define trigger, eligibility, action, cancel condition and conversion event.
4. Define control/holdout when measuring incremental impact.
5. Check consent, quiet hours, suppression and frequency cap.
6. Specify server-side events and attribution fields.
7. Check failure, retry, deduplication and observability.
8. State KPI and guardrail metric.

## Event standard

Use a versioned envelope containing:

- `eventId`, `eventName`, `occurredAt`, `schemaVersion`
- `actorUserId`, `activeRole`, `tenantId/clubId`
- `source`, `platform`, `locale`, `timezone`
- `correlationId`
- minimal non-sensitive properties

Revenue, booking, check-in, membership, subscription and referral qualification events must originate server-side.

Use a Transactional Outbox for domain events. Consumers must be idempotent and support retry, dead-letter handling and deduplication.

## Attribution

- Store first-touch and last-touch separately.
- Capture UTM, referrer, landing page, referral/affiliate and deep-link source.
- Preserve existing referral attribution during MongoDB→PostgreSQL migration.
- Never overwrite original first-touch.
- Do not infer campaign success from clicks when a payment/check-in conversion exists.

## Lifecycle safeguards

- Transactional and marketing messages are separate purposes.
- SMS is for OTP and approved critical fallback; prefer in-app/push for lower urgency.
- WhatsApp/Telegram require an official provider, explicit consent and opt-out.
- Health, KYC, private messages and progress photos are not marketing segment inputs.
- Discounts are not the default retention intervention.
- Referral rewards qualify only after a trusted conversion and write Ledger entries.
- Refund/fraud uses reversal or clawback, never record deletion.

## Churn

Start with transparent rules using:

- days since last check-in;
- remaining credits;
- days to membership expiry;
- recent no-shows;
- failed payments;
- unresolved support cases.

Do not introduce ML until event quality, outcome labels and experiment discipline are reliable.

## Required output

For growth implementation or review, provide:

- hypothesis and persona;
- trigger/segment/journey;
- event and attribution changes;
- channels and consent rules;
- KPI, guardrail and holdout;
- failure/retry/idempotency behavior;
- affected API/mobile/admin/website surfaces;
- rollout and rollback plan.

Update `growth-lifecycle.md`, user stories, scenarios and checklist when scope or status changes.
