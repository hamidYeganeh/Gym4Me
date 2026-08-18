# Gym4Me

Monorepo for the Gym4Me platform — Iranian clubs, coaches, athletes, and ops.

## Apps

| App | Path | Port | Role |
|-----|------|------|------|
| API | `apps/api` | 8088 | NestJS + MongoDB source of truth |
| Mobile | `apps/mobile` | 8081 | Multi-role Next + Capacitor app |
| Admin | `apps/admin` | 8082 | Vite ops panel |
| Website | `apps/website` | 8080 | Public / SEO marketing |

## Packages

| Package | Purpose |
|---------|---------|
| `@repo/api` | Typed HTTP client, DTOs, React Query hooks |
| `@repo/ui` | Shared product UI (HeroUI + icons) |
| `@repo/theme` / `@repo/icons` / `@repo/fonts` / `@repo/i18n` | Design system + copy |

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
