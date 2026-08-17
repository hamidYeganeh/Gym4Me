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

## Path aliases

| Alias | Resolves to |
|-------|-------------|
| `@/*` | `src/*` |
| `@modules/*` | `src/modules/*` |
| `@shared/*` | `src/shared/*` |

Configured in each app `tsconfig` (`baseUrl` + `paths`) and admin `vite.config.ts` `resolve.alias`. Prefer these over deep `../../../` imports.

## HeroUI v3 primitives

Use `@heroui/react` (see heroui-react skill / MCP) — **not** raw HTML for product UI:

| Instead of | Use |
|------------|-----|
| `<h1>`–`<h6>`, `<p>` (copy) | `<Typography type="h1"\|…\|body-sm">` |
| `<button>` | `<Button onPress={…}>` (`isIconOnly` → `size="lg"`) |
| custom modal chrome | `<Modal>` / existing shared dialogs built on HeroUI |

No `HeroUIProvider`. Compound components. Semantic variants (`primary` / `secondary` / `tertiary` / `danger` / `ghost`).

## i18n

- All user-facing strings via `next-intl` / `useTranslations` + `packages/i18n/messages/fa.json`
- No hardcoded Persian or English copy, placeholders, or `aria-label`s in TSX
- Dynamic API error messages may render as-is when already localized by the API

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
- [ ] Typography / Button / Modal from HeroUI; no raw heading/paragraph/button for product copy
- [ ] No hardcoded user-facing strings

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
