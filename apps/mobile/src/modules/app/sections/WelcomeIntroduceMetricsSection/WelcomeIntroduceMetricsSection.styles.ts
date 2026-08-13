import { tv } from "tailwind-variants";

/** Metrics stack — Figma 343px band, middle pressure card emphasized. */
export const welcomeIntroduceMetricsSectionVariants = tv({
  slots: {
    root: "mx-auto flex w-full max-w-[21.5rem] shrink-0 flex-col gap-3",
    item: "w-full",
    itemPressure: "relative z-10 scale-[1.015]",
  },
});
