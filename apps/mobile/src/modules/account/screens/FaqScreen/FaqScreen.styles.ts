import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const faqScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-4 pb-12 pt-1",
    intro: "mb-2 flex flex-col gap-1",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    list: "flex flex-col gap-3",
    item: "rounded-2xl border border-separator bg-surface px-4 py-3",
    question: "text-foreground",
    answer: "mt-2 text-muted whitespace-pre-wrap",
    empty: "py-16 text-center text-muted",
  },
});

export type FaqScreenVariants = VariantProps<typeof faqScreenVariants>;
