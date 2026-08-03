# Gym4Me Admin

Vite + React admin app for **Gym4Me**. Uses HeroUI v3, `@repo/theme`, `@repo/icons`, `@repo/i18n` (next-intl), and `@repo/ui/layout/AdminDashboardLayout`.

App name is always **Gym4Me**. Page titles and meta copy come from the `Admin` namespace in `@repo/i18n` (`fa.json`), with document title formatted as `{metaTitle} | Gym4Me`.

## Develop

From the repo root:

```sh
npm run dev:admin
```

Or:

```sh
npx turbo run dev --filter=admin
```

App runs at [http://localhost:8082](http://localhost:8082).
