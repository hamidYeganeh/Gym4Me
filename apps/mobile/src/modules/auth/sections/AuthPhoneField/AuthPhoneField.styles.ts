import { tv } from "tailwind-variants";

export const authPhoneFieldVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-2",
    label: "text-sm font-bold text-foreground",
    field:
      "flex min-h-14 flex-row items-center gap-3 rounded-2xl border border-border bg-field px-4 [direction:ltr] transition-[border-color,box-shadow,background-color] duration-fast ease-app focus-within:border-accent focus-within:shadow-[0_0_0_4px_color-mix(in_oklch,var(--accent)_22%,transparent)] dark:border-border/80 dark:bg-surface",
    country:
      "flex shrink-0 flex-row items-center gap-1.5 text-sm font-semibold text-foreground",
    countryFlag: "text-base leading-none",
    countryCode: "tracking-wide",
    divider: "h-6 w-px bg-border",
    input:
      "min-h-12 flex-1 border-0 bg-transparent px-0 text-base text-foreground shadow-none outline-none placeholder:text-muted",
  },
});
