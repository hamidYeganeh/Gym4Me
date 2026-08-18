import { tv } from "tailwind-variants";

export const usersDetailProfileSectionVariants = tv({
  slots: {
    root: "grid gap-6 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-10",
    aside: "min-w-0",
    title: "text-base font-bold text-foreground",
    description: "mt-2 text-sm leading-6 text-muted",
    card: "rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6",
  },
});
