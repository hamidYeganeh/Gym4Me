import { tv } from "tailwind-variants";

export const weightSliderVariants = tv({
  slots: {
    root: [
      "relative flex h-[220px] w-full touch-none flex-col items-center",
      "overflow-hidden rounded-[28px] border border-border bg-surface",
      "text-surface-foreground font-sans transition-colors duration-moderate ease-app select-none",
      "sm:h-[260px] sm:rounded-[36px]",
    ].join(" "),
    label:
      "mt-5 text-base font-semibold tracking-wide text-muted capitalize transition-colors duration-moderate ease-app sm:mt-6 sm:text-xl",
    dialArea: "relative flex w-full flex-1 items-start justify-center",
    panLayer: "absolute flex h-full w-full cursor-[var(--pointer-cursor)] items-start",
    indicator:
      "pointer-events-none absolute bottom-0 z-20 mb-1 flex flex-col items-center sm:mb-0",
    indicatorDot:
      "mb-1.5 h-[5px] w-[5px] rounded-full bg-accent transition-colors duration-moderate ease-app sm:h-[6.5px] sm:w-[6.5px]",
    indicatorArrow:
      "h-6 w-2 text-accent transition-colors duration-moderate ease-app sm:h-9 sm:w-[10px]",
    dialItem: "absolute top-0 flex flex-col items-center",
    dialValue: "text-[56px] font-bold tracking-tight sm:text-[68px]",
    dialTickWrap: "mt-2 flex flex-col items-center sm:mt-4",
    dialTick:
      "h-5 w-[2.5px] rounded-full bg-border transition-colors duration-moderate ease-app sm:h-7 sm:w-[3px]",
  },
});
