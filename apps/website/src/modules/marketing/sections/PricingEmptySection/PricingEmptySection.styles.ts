import { tv } from "tailwind-variants";

export const pricingEmptySectionVariants = tv({
  slots: {
    emptySection:
      "mx-auto max-w-2xl rounded-[2rem] border border-border bg-surface p-8 text-center",
    emptyTitle: "text-2xl font-bold",
    emptyBody: "mt-4 leading-8 text-muted",
    emptyCta:
      "mt-6 inline-block rounded-2xl border border-border px-5 py-3 font-semibold",
  },
});
