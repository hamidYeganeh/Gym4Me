import { tv } from "tailwind-variants";

export const onboardingHeaderVariants = tv({
  slots: {
    root: "flex w-full items-center gap-3",
    back: "min-w-11 shrink-0 text-foreground outline-none data-[hovered=true]:bg-default/60 data-[pressed=true]:scale-95",
    backIcon: "size-6",
    progressGroup: "flex min-w-0 flex-1 flex-col gap-1.5",
    stepLabel: "text-center text-[0.7rem] font-semibold tabular-nums text-muted",
    progress: "min-w-0 flex-1",
    track: "h-1.5 overflow-hidden rounded-full bg-default",
    fill: "h-full rounded-full bg-accent transition-[width] duration-300 ease-out",
    skip: "shrink-0 text-sm font-bold text-accent outline-none data-[hovered=true]:bg-accent/10",
  },
});
