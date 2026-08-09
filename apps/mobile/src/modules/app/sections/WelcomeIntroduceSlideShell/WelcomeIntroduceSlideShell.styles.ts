import { tv } from "tailwind-variants";

export const welcomeIntroduceSlideShellVariants = tv({
  slots: {
    root: "flex min-h-0 w-full min-w-0 shrink-0 grow-0 basis-full flex-col overflow-visible bg-transparent",
    stack: "flex min-h-0 flex-1 flex-col",
    copy: "flex shrink-0 flex-col items-center gap-3 pt-4 text-center",
    title:
      "max-w-[22ch] text-balance text-[1.75rem] leading-tight font-bold tracking-tight text-foreground sm:max-w-[26ch] sm:text-[2rem]",
    subtitle:
      "mb-8 max-w-[34ch] text-pretty text-[0.95rem] leading-relaxed text-muted",
    stage:
      "relative flex min-h-0 flex-1 items-end justify-center overflow-visible pb-1",
  },
});
