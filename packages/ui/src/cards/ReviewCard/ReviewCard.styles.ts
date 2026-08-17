import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const reviewCardVariants = tv({
  slots: {
    root: [
      "w-full gap-4 overflow-hidden rounded-[32px] p-6",
      "border-0 bg-surface text-surface-foreground",
    ].join(" "),
    header: "flex flex-row items-center gap-3 p-0",
    avatar: "size-12 shrink-0 rounded-[0.875rem]",
    meta: "flex min-w-0 flex-1 flex-col gap-0.5",
    date: "text-muted",
    title: "tracking-tight text-foreground",
    content: "p-0",
    body: "text-[15px] leading-relaxed text-muted",
    ratingBlock: "flex flex-col gap-2",
    ratingRow: "flex items-center gap-2",
    stars: "flex items-center gap-0.5",
    star: "shrink-0 text-accent",
    starEmpty: "shrink-0 text-accent/35",
    ratingValue: "text-foreground",
    verified: "inline-flex items-center gap-1.5 text-success",
    verifiedIcon: "size-5 shrink-0 text-success",
    verifiedLabel: "text-sm font-medium text-success",
    footer: "flex flex-row items-center gap-4 p-0",
    action: [
      "h-auto min-h-0 gap-1.5 px-0 py-0",
      "text-sm font-medium text-foreground",
      "shadow-none data-[hovered=true]:opacity-80",
    ].join(" "),
    actionIcon: "size-4 shrink-0 text-foreground",
    report: [
      "ms-auto h-auto min-h-0 px-0 py-0",
      "text-sm font-bold text-accent",
      "shadow-none data-[hovered=true]:opacity-80",
    ].join(" "),
  },
});

export type ReviewCardVariantProps = VariantProps<typeof reviewCardVariants>;
