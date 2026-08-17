import { tv } from "tailwind-variants";

export const athleteWeightDetailHeroSectionVariants = tv({
  slots: {
    root: "flex flex-col items-center gap-3 text-center",
    iconWrap:
      "flex size-14 items-center justify-center rounded-2xl bg-success text-success-foreground",
    weightRow: "flex items-baseline justify-center gap-1.5",
    weightValue: "text-[40px] leading-none tracking-tight text-foreground",
    weightUnit: "text-xl text-muted",
    bmiStatus: "text-foreground",
    metaRow: "flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-muted",
    metaDot: "size-1 rounded-full bg-muted",
    tip: "max-w-sm text-muted",
  },
});
