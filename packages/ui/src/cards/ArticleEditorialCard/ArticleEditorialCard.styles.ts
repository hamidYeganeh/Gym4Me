import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

const onCardMuted = "text-background/70 dark:text-foreground/70";
const onCard = "text-background dark:text-foreground";
const onCardSoft = "text-background/85 dark:text-foreground/85";
const onCardWash = "bg-background/12 dark:bg-foreground/12";
const bone = "bg-background/15 dark:bg-foreground/12";

export const articleEditorialCardVariants = tv({
  slots: {
    root: [
      "flex h-auto min-h-[17.5rem] w-full flex-col items-stretch gap-4",
      "rounded-[2rem] bg-foreground p-5 text-start text-background",
      "dark:bg-surface-secondary dark:text-foreground",
      "shadow-none",
    ].join(" "),
    chip: [
      "w-fit max-w-full gap-1.5 border-0 px-2.5",
      onCardWash,
      onCard,
    ].join(" "),
    chipIcon: `shrink-0 [&_svg]:size-3.5 ${onCard}`,
    chipLabel: onCard,
    date: onCardMuted,
    title: [
      "line-clamp-3 text-pretty text-[1.35rem] leading-snug",
      "tracking-tight",
      onCard,
    ].join(" "),
    footer: "mt-auto flex items-end justify-between gap-4",
    meta: "flex min-w-0 flex-1 flex-col gap-1.5",
    metaRow: `flex items-center gap-1.5 ${onCardSoft}`,
    metaIcon: `shrink-0 [&_svg]:size-3.5 ${onCard}`,
    metaText: `min-w-0 truncate ${onCardSoft}`,
    action: [
      "shrink-0 rounded-full shadow-none",
      onCardWash,
      onCard,
    ].join(" "),
    skeletonChip: `h-7 w-24 rounded-full ${bone}`,
    skeletonDate: `h-4 w-36 rounded-md ${bone}`,
    skeletonTitle: `h-7 w-full rounded-lg ${bone}`,
    skeletonTitleLine: `h-7 w-4/5 self-start rounded-lg ${bone}`,
    skeletonMeta: `h-3.5 w-28 rounded-md ${bone}`,
    skeletonMetaShort: `h-3.5 w-20 rounded-md ${bone}`,
    skeletonAction: `size-12 shrink-0 rounded-full ${bone}`,
  },
});

export type ArticleEditorialCardVariantProps = VariantProps<
  typeof articleEditorialCardVariants
>;
