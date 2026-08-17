# Frontend Architecture Checklist

Living checklist for `apps/mobile`, `apps/admin`, and `apps/website`. Aligns with `.cursor/rules/frontend-architecture.mdc` and `docs/product/architecture-completion-guardrails.md`.

## Layout

```text
src/
  app/                 # routing only
  modules/<domain>/
    screens/           # thin composers
    sections/          # page sections (4-file folders)
    lib/               # hooks, adapters, mocks
    components/        # domain-private composites (optional)
  shared/              # app-shell glue only
```

## Per-screen Definition of Done

- [ ] Screen `.tsx` **&lt;300** lines (stretch **&lt;150** for pure composers)
- [ ] Folder has `Name.tsx` / `Name.styles.ts` / `Name.types.ts` / `index.ts`
- [ ] Business UI lives in `sections/` (same 4-file shape)
- [ ] Data via `lib/use-*` or `*ScreenLoader` — no raw backend `fetch` in screens
- [ ] Styles only in `*.styles.ts` via `tailwind-variants` (`tv`)
- [ ] Props/types only in `*.types.ts` (UI props; no duplicated API DTOs)
- [ ] Icons via `@repo/icons/Name`; UI via `@repo/ui/<category>/<Name>`
- [ ] No `@repo/ui/kit` or `@repo/ui/cards` barrel imports from screens
- [ ] No cross-module deep `lib/` imports
- [ ] Production empty/error states never filled with mock fixtures
- [ ] Visual/behavior parity after extraction (routes, i18n keys, loading)

## Size guardrails

| Signal | Action |
|--------|--------|
| Screen/section &gt;300 lines | Extract sections before merging feature work |
| File &gt;600 lines | Extraction required when the file is touched |
| Shared rail chrome | Prefer `DiscoverySectionRail` (mobile discovery) over local duplicates |

## Loader pattern

Prefer: `*ScreenLoader` (fetch/map) → presentational `*Screen` (props in).

## Re-render hygiene

- Keep dialog/sheet open state in the subtree that owns the chrome (e.g. header + sheet)
- Prefer section-local `useRouter` over prop-drilling navigation into every rail
- Memoize only where parent re-renders are frequent and measured
