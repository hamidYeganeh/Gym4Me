import { tv } from "tailwind-variants";

export const welcomeIntroduceCommunitySectionVariants = tv({
  slots: {
    root: "relative mx-auto w-full max-w-[22.5rem] shrink-0 px-1",
    stack: "relative pb-3",
    layerBack: [
      "pointer-events-none absolute inset-x-4 top-4 h-[calc(100%-0.75rem)]",
      "rounded-[1.75rem] border border-border bg-foreground/10",
    ],
    layerMid: [
      "pointer-events-none absolute inset-x-2 top-2 h-[calc(100%-0.5rem)]",
      "rounded-[1.75rem] border border-border bg-foreground/20",
    ],
    card: "relative z-10",
  },
});
