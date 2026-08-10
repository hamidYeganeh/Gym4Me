import { tv } from "tailwind-variants";

export const onboardingReviewSectionVariants = tv({
  slots: {
    root: "flex w-full flex-col items-center justify-center",
    artWrap:
      "relative flex w-full max-w-xs items-center justify-center sm:max-w-sm",
    art: "h-auto w-full max-w-[16rem] object-contain sm:max-w-[18rem]",
  },
});
