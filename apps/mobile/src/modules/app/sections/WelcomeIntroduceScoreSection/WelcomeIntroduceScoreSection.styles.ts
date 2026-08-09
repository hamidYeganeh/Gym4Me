import { tv } from "tailwind-variants";

export const welcomeIntroduceScoreSectionVariants = tv({
  slots: {
    /** Phone composition sits in the centered stage. */
    root: "relative mx-auto h-[min(52dvh,400px)] w-full max-w-screen-frame shrink-0",
    /** Height-driven phone; aspect matches `phone-frame.png` (540×1024) so no letterbox above the device. */
    phoneWrap:
      "pointer-events-none absolute bottom-0 left-1/2 z-0 h-full w-auto max-w-[69.333%] aspect-[540/1024] -translate-x-1/2",
    /** Opaque fill behind the transparent screen cutout — matches lower introduce gradient wash. */
    phoneScreen:
      "absolute inset-[2.2%_5.2%_2.2%_5.2%] rounded-[14%] bg-[color-mix(in_oklch,var(--accent)_26%,var(--background))]",
    phoneFrame:
      "pointer-events-none absolute inset-0 z-[1] h-full w-full select-none object-fill",
    /** Wider than the phone (~324/260), floating over the lower mid of the device. */
    cardWrap:
      "absolute bottom-[14%] left-1/2 z-10 w-[86.4%] max-w-none -translate-x-1/2",
  },
});
