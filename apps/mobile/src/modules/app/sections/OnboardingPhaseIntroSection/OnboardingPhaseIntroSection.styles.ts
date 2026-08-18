import { tv } from "tailwind-variants";

export const onboardingPhaseIntroSectionVariants = tv({
  slots: {
    root: "relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-background",
    media: "pointer-events-none absolute inset-0",
    image: "object-cover object-center size-full",
    topFade: "pointer-events-none absolute inset-x-0 top-0 z-[1] h-56",
    topBlur: "pointer-events-none absolute inset-0",
    topWash: [
      "absolute inset-0",
      "bg-[linear-gradient(to_bottom,var(--background)_0%,color-mix(in_oklch,var(--background)_78%,transparent)_48%,transparent_100%)]",
    ],
    bottomFade: "pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-44",
    bottomBlur: "pointer-events-none absolute inset-0",
    bottomWash: [
      "absolute inset-0",
      "bg-[linear-gradient(to_top,var(--background)_0%,color-mix(in_oklch,var(--background)_78%,transparent)_48%,transparent_100%)]",
    ],
    content: [
      "relative z-10 flex w-full flex-col items-center gap-6",
      "px-5 pt-[calc(3.5rem+env(safe-area-inset-top))]",
    ],
    stepper: "w-full",
    copy: "flex flex-col items-center gap-3 px-2 text-center",
    title:
      "text-balance text-[1.55rem] leading-tight font-bold text-foreground sm:text-[1.75rem]",
    subtitle: "text-pretty text-base leading-7 text-muted",
  },
});
