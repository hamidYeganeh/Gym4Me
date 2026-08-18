export const articlesListScreenStyles = {
  root: "min-h-screen bg-background px-6 py-16 text-foreground",
  container: "mx-auto flex w-full max-w-3xl flex-col gap-8",
  intro: "flex flex-col gap-3",
  title: "tracking-tight",
  subtitle: "max-w-2xl text-muted leading-7",
  filters: "flex flex-col gap-3",
  chips: "flex flex-wrap gap-2",
  chip: "rounded-full border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-foreground hover:text-foreground",
  chipActive: "border-foreground bg-foreground text-background",
  list: "flex flex-col gap-4",
  empty: "text-muted",
} as const;
