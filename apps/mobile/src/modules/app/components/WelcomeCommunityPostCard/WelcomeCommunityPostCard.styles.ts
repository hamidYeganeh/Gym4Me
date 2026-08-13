import { tv } from "tailwind-variants";

export const welcomeCommunityPostCardVariants = tv({
  slots: {
    root: [
      "relative flex w-full flex-col gap-4 overflow-hidden rounded-[1.75rem]",
      "border-0 bg-surface p-5 text-surface-foreground shadow-sm shadow-foreground/5",
      "shadow-[0_18px_44px_-18px_color-mix(in_oklab,var(--foreground)_18%,transparent)]",
    ],
    header: "flex w-full flex-row items-start justify-between gap-3 p-0",
    authorBlock: "flex min-w-0 flex-col gap-0.5",
    authorRow: "flex min-w-0 items-center gap-1.5",
    author: "truncate text-[0.95rem] font-bold text-foreground",
    verified:
      "inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground",
    verifiedIcon: "size-2.5",
    postedAt: "text-xs text-muted",
    menu: [
      "size-9 shrink-0 rounded-full border-0 bg-transparent text-muted",
      "shadow-none data-[hovered=true]:bg-default data-[pressed=true]:scale-95",
      "[&_svg]:size-5",
    ],
    body: "flex flex-col gap-3 p-0 text-[0.95rem] leading-relaxed text-foreground",
    paragraph: "text-pretty whitespace-pre-line",
    hashtagRow: "flex flex-wrap items-center gap-x-1.5 gap-y-1",
    hashtag: "font-medium text-accent",
    footer:
      "flex w-full flex-row items-center justify-between gap-3 border-t border-border pt-4",
    metrics: "flex min-w-0 items-center gap-3.5 text-muted",
    metric: "inline-flex items-center gap-1.5 text-xs tabular-nums",
    metricIcon: "size-4 shrink-0",
    save: [
      "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-0",
      "border-0 bg-transparent text-sm font-medium text-foreground shadow-none",
      "data-[hovered=true]:opacity-90 data-[pressed=true]:scale-[0.98]",
    ],
    saveIcon: "size-4 text-stats-blue",
  },
});
