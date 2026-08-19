export const articleDetailScreenStyles = {
  root: "min-h-dvh bg-background px-4 py-10 text-foreground sm:px-6 sm:py-14 lg:px-8 lg:py-16",
  article: "mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-6",
  back: "inline-flex min-h-11 items-center text-sm font-medium text-muted hover:text-foreground",
  hero: "flex flex-col gap-4 rounded-3xl bg-surface p-5 sm:p-6",
  categoryChip:
    "inline-flex w-fit items-center rounded-full bg-warning px-3 py-1 text-xs font-semibold text-eclipse",
  title: "tracking-tight text-balance",
  meta: "flex flex-wrap items-center gap-2 text-sm text-muted",
  authorRow: "flex items-center gap-2",
  authorName: "text-sm text-muted",
  cover: "relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-surface",
  coverImage: "object-cover",
  body: "max-w-none overflow-x-clip leading-8 text-foreground/90 [&_a]:text-accent [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-xl [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:ps-6 [&_p]:my-3 [&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto [&_ul]:my-4 [&_ul]:list-disc [&_ul]:ps-6",
  stats: "flex flex-wrap gap-4 text-sm text-muted",
  relatedSection: "mx-auto mt-10 flex w-full min-w-0 max-w-5xl flex-col gap-4",
  relatedTitle: "tracking-tight",
  relatedGrid: "grid grid-cols-1 gap-4 lg:grid-cols-2",
} as const;
