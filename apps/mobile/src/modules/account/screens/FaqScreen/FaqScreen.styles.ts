import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const faqScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-12 pt-2",
    intro: "mb-2 flex flex-col gap-1",
    introTitle: "text-balance tracking-tight text-foreground",
    introSubtitle: "max-w-[21rem] text-pretty leading-relaxed text-muted",
    list: "flex flex-col gap-3",
    item: "rounded-[1.25rem] border-0 bg-surface px-4 py-3",
    question: "text-foreground",
    answer: "mt-2 text-muted whitespace-pre-wrap",
    empty: "py-8",
  },
});

export type FaqScreenVariants = VariantProps<typeof faqScreenVariants>;
