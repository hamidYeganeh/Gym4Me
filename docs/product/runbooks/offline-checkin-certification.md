# Offline check-in certification runbook (Android + iOS)

Last updated: 2026-08-27

This runbook certifies Gym4Me owner/staff offline check-in on physical devices. **G4M-051 stays `PARTIAL` until this runbook passes on at least one Android and one iOS device.**

## Prerequisites

- Production-like API with Mongo replica-set and `OFFLINE_CHECKIN_SIGNING_SECRET` (≥32 chars)
- Owner or staff account with `members.checkin` permission
- Capacitor mobile build (`apps/mobile`) on a real device (not browser-only)
- Test club with at least one **confirmed booking** in the next 12 hours and one **active membership** with remaining credit
- Network toggle (airplane mode) access on device

## Environment safety

- `OFFLINE_CHECKIN_TEST_FAILURES` must be **unset** in production and certification runs
- Failure injection is for automated test/dev only (`apps/api/src/checkin/offline-checkin-test-failures.ts`)

## 1. Device provision

1. Sign in as owner/staff and open **میز پذیرش** (`/owner/check-in`).
2. Confirm a Capacitor device is auto-provisioned (first snapshot issuance succeeds).
3. In admin/API, verify device appears under club check-in devices with status `active`.

**Pass:** snapshot issues without error; no secret displayed in UI after first provision.

## 2. Offline booking check-in

1. Note booking code `G4M-XXXX` from a confirmed booking in snapshot window.
2. Enable airplane mode.
3. Enter booking code on check-in desk → expect **queued offline** message.
4. Verify queue count increases in UI.

**Pass:** item queued; no attendance created online while offline.

## 3. Reconnect sync

1. Disable airplane mode; wait for auto-sync (or reload screen).
2. Confirm queue count returns to 0 and success/reconciliation message shown.
3. Verify attendance exists in API for that booking (single row).

**Pass:** exactly one check-in; membership/booking state consistent.

## 4. Duplicate replay

1. Repeat sync with same queued payload (if still available) or replay batch via API test harness.
2. Confirm second attempt returns `duplicate`, not a second attendance.

**Pass:** idempotent server key `offline:{snapshotId}:{sequence}:{nonceHash}` prevents double consumption.

## 5. Device revoke

1. Revoke Capacitor device from club devices API/admin.
2. Attempt offline sync or new snapshot on mobile.

**Pass:** sync blocked with 401/403; local queue cleared; recovery CTA shown (`recoveryRevokedDevice`).

## 6. Clock change

1. With valid snapshot, change device clock forward beyond snapshot `expiresAt` (or wait until expiry).
2. Attempt to queue a new offline check-in.

**Pass:** queue rejected as not eligible / stale snapshot; recovery CTA offers refresh.

## 7. Review / dismiss (optional conflict)

1. Force a `review` reconciliation (e.g. consume membership elsewhere, then sync offline membership check-in via API e2e).
2. Open review list on desk; **retry** or **dismiss** with reason.

**Pass:** dismiss creates no attendance/Ledger; retry uses original actor + server idempotency key; audit log entry present.

## Telemetry checklist (no PII)

Confirm analytics/audit events contain only:

- `kind`, counts, latency, `reasonCode` enums
- snapshot/device/club **IDs** (Mongo ObjectIds)

Must **not** contain:

- Raw booking codes / QR payloads
- Device secrets or snapshot tokens
- Health or athlete notes

## Automated gates (CI)

Before device certification:

```bash
# API
cd apps/api && npx jest src/checkin/offline-checkin --no-cache

# Mobile queue
cd apps/mobile && npx jest src/modules/owner/lib/offline-checkin-queue.test.ts --no-cache

# Shell integration (requires local stack)
cd apps/api && ./test/e2e-scenario.sh S7
```

## Sign-off

| Platform | Device | OS version | Tester | Date | Result |
|----------|--------|------------|--------|------|--------|
| Android  |        |            |        |      |        |
| iOS      |        |            |        |      |        |

When both rows pass, update `docs/product/cursor-service-completion-tasks.md` SVC-003 and G4M-051 from `PARTIAL`/`VERIFY` to `DONE`.
