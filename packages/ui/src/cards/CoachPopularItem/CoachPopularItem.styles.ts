import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const coachPopularItemVariants = tv({
  slots: {
    root: [
      "flex h-auto w-full items-center gap-3 rounded-none bg-transparent px-4 py-3.5",
      "text-start shadow-none",
      "hover:bg-surface-secondary/60 data-[hovered=true]:bg-surface-secondary/60",
      "data-[pressed=true]:scale-[0.995]",
      "[--button-bg:transparent] [--button-bg-hover:transparent] [--button-bg-pressed:transparent]",
    ].join(" "),
    rank: [
      "flex size-7 shrink-0 items-center justify-center rounded-full",
      "bg-foreground text-xs font-bold text-background",
    ].join(" "),
    avatarWrap: "relative size-11 shrink-0 overflow-hidden rounded-full",
    avatar: "pointer-events-none absolute inset-0 size-full object-cover",
    content: "flex min-w-0 flex-1 flex-col gap-0.5",
    title: "truncate tracking-tight text-foreground",
    meta: "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted",
    rating: "inline-flex items-center gap-1 text-foreground",
    star: "size-3.5 shrink-0 text-warning",
    chevron: "size-4 shrink-0 text-muted",
  },
});

export type CoachPopularItemVariantProps = VariantProps<
  typeof coachPopularItemVariants
>;
