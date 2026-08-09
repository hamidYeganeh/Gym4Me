import { tv } from "tailwind-variants";

export const welcomeIntroduceScoreSectionVariants = tv({
  slots: {
    /** Sit on the bottom of the slide stage (Figma intro composition). */
    root: "relative mx-auto mt-auto h-[min(52dvh,400px)] w-full max-w-screen-frame shrink-0",
    /** Height-driven phone so the full device fits in the stage without clipping. */
    phoneWrap:
      "pointer-events-none absolute bottom-0 left-1/2 z-0 h-full w-auto max-w-[69.333%] aspect-[260/529] -translate-x-1/2",
    /** Opaque screen so adjacent Embla slides never show through the bezel. */
    phoneScreen: "absolute inset-[2.2%_5.2%_2.2%_5.2%] rounded-[14%] bg-black",
    phoneFrame:
      "pointer-events-none absolute inset-0 z-[1] h-full w-full select-none object-contain object-bottom",
    /** Wider than the phone (~324/260), floating over the lower mid of the device. */
    cardWrap:
      "absolute bottom-[14%] left-1/2 z-10 w-[86.4%] max-w-none -translate-x-1/2",
  },
});
