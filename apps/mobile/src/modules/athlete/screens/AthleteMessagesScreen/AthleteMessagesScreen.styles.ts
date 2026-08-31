import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const athleteMessagesScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-4 pb-12 pt-1",
    intro: "mb-1 flex flex-col gap-1",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    list: "flex flex-col gap-2",
    item: "flex w-full items-center gap-3 border-0 bg-surface text-start",
    itemIcon:
      "flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent",
    itemBody: "flex min-w-0 flex-1 flex-col gap-0.5",
    itemPreview: "truncate text-muted",
    itemMeta: "shrink-0 text-muted",
    empty: "flex flex-col items-center gap-2 text-center",
  },
});

export type AthleteMessagesScreenVariants = VariantProps<
  typeof athleteMessagesScreenVariants
>;
