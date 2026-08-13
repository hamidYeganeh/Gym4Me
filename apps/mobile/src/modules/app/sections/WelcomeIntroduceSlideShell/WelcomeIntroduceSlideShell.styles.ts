import { tv } from "tailwind-variants";

/** Matches Sandow welcome frame: 16px gutters, ~32px title, 208px copy band. */
export const welcomeIntroduceSlideShellVariants = tv({
  slots: {
    root: "flex min-h-0 w-full min-w-0 shrink-0 grow-0 basis-full flex-col overflow-visible bg-transparent",
    stack: "flex min-h-0 flex-1 flex-col",
    copy: "flex shrink-0 flex-col items-center gap-4 px-0 pt-8 text-center",
    title:
      "max-w-[21.5rem] text-balance text-[2rem] leading-[1.2] font-bold tracking-tight text-foreground",
    subtitle:
      "max-w-[21.5rem] text-pretty text-[0.9375rem] leading-[1.4] text-muted",
    stage:
      "relative flex min-h-0 flex-1 items-center justify-center overflow-visible py-2",
  },
});
