import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const supportTicketsScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-4 pb-12 pt-1",
    intro: "mb-1 flex flex-col gap-1",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    list: "flex flex-col gap-3",
    item: "flex flex-col gap-1 rounded-2xl border border-separator bg-surface px-4 py-3 text-start",
    itemMeta: "text-muted",
    empty: "py-16 text-center text-muted",
    form: "flex flex-col gap-3 rounded-2xl border border-separator bg-surface p-4",
    actions: "mt-2 flex flex-col gap-2",
  },
});

export type SupportTicketsScreenVariants = VariantProps<
  typeof supportTicketsScreenVariants
>;
