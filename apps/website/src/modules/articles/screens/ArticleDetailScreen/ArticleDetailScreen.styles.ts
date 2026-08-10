export const articleDetailScreenStyles = {
  root: "min-h-screen bg-background px-6 py-16 text-foreground",
  article: "mx-auto flex max-w-3xl flex-col gap-6",
  back: "text-sm font-medium text-muted hover:text-foreground",
  hero: "flex flex-col gap-4 rounded-3xl bg-surface p-6",
  categoryChip:
    "inline-flex w-fit items-center rounded-full bg-warning px-3 py-1 text-xs font-semibold text-eclipse",
  title: "tracking-tight",
  meta: "flex flex-wrap items-center gap-2 text-sm text-muted",
  authorRow: "flex items-center gap-2",
  authorName: "text-sm text-muted",
  cover: "relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-surface",
  coverImage: "object-cover",
  body: "max-w-none leading-8 text-foreground/90 [&_a]:text-accent [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_img]:my-4 [&_img]:rounded-xl [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:ps-6 [&_p]:my-3 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:ps-6",
  stats: "flex flex-wrap gap-4 text-sm text-muted",
  relatedSection: "mx-auto mt-10 flex w-full max-w-5xl flex-col gap-4",
  relatedTitle: "tracking-tight",
  relatedGrid: "grid grid-cols-1 gap-4 lg:grid-cols-2",
} as const;
