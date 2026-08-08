export const seoCoachDetailScreenStyles = {
  root: "min-h-screen bg-background px-6 py-16 text-foreground",
  article: "mx-auto flex max-w-3xl flex-col gap-6",
  eyebrow: "text-sm font-medium text-muted",
  title: "tracking-tight",
  meta: "text-muted",
  body: "leading-8 text-foreground/90",
  stats: "grid grid-cols-1 gap-4 border-t border-border pt-6 text-sm sm:grid-cols-3 [&_dt]:text-muted [&_dd]:mt-1 [&_dd]:text-base [&_dd]:font-semibold",
  clubs: "space-y-3 border-t border-border pt-6 text-sm [&_a]:font-medium [&_a]:text-accent",
  clubMeta: "ms-2 text-muted",
} as const;
