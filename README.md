# Gym4Me

Monorepo for the Gym4Me platform — Iranian clubs, coaches, athletes, and ops.

Discovery home is composed from typed, admin-published sections through a
revision-pinned Redis feed; mobile loads up to eight sections per page and can
personalize eligible sections from the active athlete profile.
Installed section kinds also cover coaches, classes, spaces, live slots,
equipment, membership plans, capacity-backed bookable offers, and amenities.

Paid athlete club-membership and owner platform-subscription purchases use
persisted, idempotent gateway checkouts. Provider verification happens before
the Mongo transaction that activates entitlement and captures the immutable
Payment/Ledger/Outbox records; browser callback loss is recovered by leased
reconciliation workers. Native Capacitor payments return through a public API
callback broker and an allowlisted `com.gym4me.app://payment-return` deep link;
the app never submits a WebView-local origin to the PSP.

## Apps

| App     | Path           | Port | Role                             |
| ------- | -------------- | ---- | -------------------------------- |
| API     | `apps/api`     | 8088 | NestJS + MongoDB source of truth |
| Mobile  | `apps/mobile`  | 8081 | Multi-role Next + Capacitor app  |
| Admin   | `apps/admin`   | 8082 | Vite ops panel                   |
| Website | `apps/website` | 8080 | Public / SEO marketing           |

## Packages

| Package                                                      | Purpose                                    |
| ------------------------------------------------------------ | ------------------------------------------ |
| `@repo/api`                                                  | Typed HTTP client, DTOs, React Query hooks |
| `@repo/ui`                                                   | Shared product UI (HeroUI + icons)         |
| `@repo/theme` / `@repo/icons` / `@repo/fonts` / `@repo/i18n` | Design system + copy                       |

## Product docs

Authoritative sequencing and scope live under [`docs/product/`](./docs/product/):

- [`cursor-implementation-master-plan.md`](./docs/product/cursor-implementation-master-plan.md) — executable completion backlog for Cursor
- [`architecture-completion-guardrails.md`](./docs/product/architecture-completion-guardrails.md) — architecture and quality guardrails
- [`phases.md`](./docs/product/phases.md) — delivery gates
- [`checklist.md`](./docs/product/checklist.md) — implementation status
- [`decisions.md`](./docs/product/decisions.md) — locked product/architecture decisions
- [`scenarios.md`](./docs/product/scenarios.md) — end-to-end scenarios

## Local development

```bash
npm install
npm run docker:up          # mongo + redis
cp apps/api/.env.example apps/api/.env   # if needed
npm run db:seed:all -w api
# Discovery pages only (does not overwrite admin-authored pages):
npm run db:seed:discovery -w api

# Default: API + mobile only (lighter on RAM)
npm run dev

# Or start apps individually:
npm run dev:api
npm run dev:mobile
npm run dev:admin
npm run dev:website

# All four apps at once (heavy — avoid on low-RAM machines):
npm run dev:all
```

MongoDB must run as a replica set because booking, payment/Ledger, membership,
and check-in mutations use transactions. The provided Docker setup initializes
the local single-node `rs0` replica set automatically.

Production offline reception also requires a distinct, random
`OFFLINE_CHECKIN_SIGNING_SECRET` (at least 32 characters). Capacitor stores the
signed eligibility snapshot and pending attendance rows in native secure
storage; unsigned offline rows are not accepted by the API.

Frontend API base URLs come from each app’s `.env.development` / `.env.production`
(must include `/api/v1`). Defaults: LAN `http://192.168.3.106:8088/api/v1` in
development, `https://api.gym4me.ir/api/v1` in production. Copy
`.env.local.example` → `.env.local` to override on your machine.

Default demo password: `Gym4Me!123`  
Seeded phones: admin `09121111111`, owners `0912200000x`, coaches `0912300000x`, athletes `0912400000x`.

## Quality gates

```bash
npm run check-types
npm run lint
npm run build -w api
npm run build -w mobile
npm run build -w admin
npm run build -w website

# Against a running API (DEBUG_MODE=true, seeded):
bash apps/api/test/smoke-flows.sh
bash apps/api/test/integrity-flows.sh
bash apps/api/test/smoke-booking.sh
bash apps/api/test/smoke-membership.sh
```

## Phase rule

A phase is closed only when API + `@repo/api` client + consuming UI (mobile/admin/website as required) and the phase scenario suite all pass. Schema-only or mock UI does not count.
