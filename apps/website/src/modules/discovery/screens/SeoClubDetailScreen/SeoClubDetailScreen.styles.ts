export const seoClubDetailScreenStyles = {
  root: "min-h-dvh bg-background px-4 py-10 text-foreground sm:px-6 sm:py-14 lg:px-8 lg:py-16",
  article: "mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-6",
  eyebrow: "text-sm font-medium text-muted",
  title: "tracking-tight text-balance",
  meta: "text-muted",
  body: "leading-8 text-foreground/90",
  stats:
    "grid grid-cols-1 gap-4 border-t border-border pt-6 text-sm sm:grid-cols-3 [&_dt]:text-muted [&_dd]:mt-1 [&_dd]:text-lg [&_dd]:font-semibold",
} as const;
