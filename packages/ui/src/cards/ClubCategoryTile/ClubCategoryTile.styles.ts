import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const clubCategoryTileVariants = tv({
  slots: {
    root: [
      "group !flex h-auto min-h-0 w-full min-w-0 flex-row items-center",
      "justify-start gap-3 whitespace-normal py-2.5 px-3 shadow-none",
      "text-start outline-none rounded-2xl",
    ].join(" "),
    icon: [
      "inline-flex size-12 shrink-0 items-center justify-center p-1",
      "text-foreground bg-surface rounded-xl",
      "[&_svg]:!size-8",
    ].join(" "),
    copy: "flex min-w-0 flex-1 flex-col items-start justify-center gap-0.5",
    title: [
      "w-full text-start leading-tight text-foreground",
      "line-clamp-2 overflow-hidden",
    ].join(" "),
    subtitle: "w-full text-start leading-tight text-muted",
    skeletonIcon: "size-12 shrink-0 rounded-xl bg-default",
    skeletonTitle: "h-4 w-[7.5rem] max-w-full rounded-lg bg-default",
    skeletonSubtitle: "h-3 w-16 max-w-full rounded-lg bg-default",
  },
});

export type ClubCategoryTileVariantProps = VariantProps<
  typeof clubCategoryTileVariants
>;
