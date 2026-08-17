import { tv } from "tailwind-variants";

export const discoveryHomeFeaturesSectionVariants = tv({
  slots: {
    slide:
      "flex h-auto w-[5.5rem] shrink-0 snap-start flex-col items-center gap-2 bg-transparent p-0 shadow-none",
    label: "text-center text-xs font-medium leading-snug text-muted",
  },
});
