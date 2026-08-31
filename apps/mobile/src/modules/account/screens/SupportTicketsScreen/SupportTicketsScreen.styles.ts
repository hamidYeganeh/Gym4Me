import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const supportTicketsScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-12 pt-2",
    intro: "mb-1 flex flex-col gap-1",
    introTitle: "text-balance tracking-tight text-foreground",
    introSubtitle: "max-w-[21rem] text-pretty leading-relaxed text-muted",
    list: "flex flex-col gap-3",
    item: "flex flex-col gap-1 rounded-[1.25rem] border-0 bg-surface px-4 py-3 text-start",
    itemMeta: "text-muted",
    empty: "text-center text-muted",
    form: "flex flex-col gap-3 rounded-[1.5rem] border-0 bg-surface p-4",
    bodyField: "resize-none",
    actions: "mt-2 flex flex-col gap-2",
  },
});

export type SupportTicketsScreenVariants = VariantProps<
  typeof supportTicketsScreenVariants
>;
