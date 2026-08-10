import { tv } from "tailwind-variants";

export const onboardingBodyTypeSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-lg flex-col items-center gap-5",
    carousel: "w-full overflow-hidden",
    track: "flex touch-pan-y",
    slide:
      "flex min-w-0 shrink-0 grow-0 basis-[48%] items-end justify-center px-2 sm:basis-[40%]",
    card: "!h-[300px] !w-[118px] sm:!h-[340px] sm:!w-[130px]",
    hint: "flex items-center gap-2 text-foreground",
    hintIcon: "size-5 shrink-0",
    hintText: "text-sm font-medium",
    statement: "text-center text-lg font-bold text-foreground",
  },
});
