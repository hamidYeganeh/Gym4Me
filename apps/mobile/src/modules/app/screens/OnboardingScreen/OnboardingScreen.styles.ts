import { tv } from "tailwind-variants";

export const onboardingScreenVariants = tv({
  slots: {
    root: "relative flex min-h-dvh flex-col overflow-hidden bg-background text-foreground",
    content:
      "relative z-10 flex min-h-dvh flex-col px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]",
    header: "shrink-0",
    carousel: "relative min-h-0 w-full flex-1 overflow-hidden",
    track: "flex h-full touch-pan-y",
    footer: "shrink-0 pt-3",
    experienceActions: "flex w-full flex-col gap-3",
    continue:
      "min-h-14 w-full rounded-[1.35rem] text-base font-bold text-accent-foreground",
    continueSoft:
      "min-h-14 w-full rounded-[1.35rem] bg-accent/25 text-base font-bold text-accent data-[hovered=true]:bg-accent/30 data-[pressed=true]:bg-accent/35",
    continueIcon: "ms-2 size-5",
    experienceYes:
      "min-h-14 w-full rounded-[1.35rem] text-base font-bold text-accent-foreground",
    experienceYesIcon: "ms-2 size-5",
    experienceNo:
      "min-h-14 w-full rounded-[1.35rem] border border-accent/40 bg-accent/10 text-base font-bold text-accent data-[hovered=true]:bg-accent/15",
    experienceNoIcon: "me-2 size-5",
    caloriesFooter: "flex w-full flex-col items-center gap-3",
    caloriesUnknown:
      "text-sm font-bold text-accent outline-none data-[hovered=true]:bg-transparent data-[hovered=true]:opacity-80",
  },
});
