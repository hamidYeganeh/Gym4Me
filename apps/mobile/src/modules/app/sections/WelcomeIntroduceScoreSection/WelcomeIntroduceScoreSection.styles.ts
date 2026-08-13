import { tv } from "tailwind-variants";

/** Slide 0 — Figma phone (260×529) + floating score card (324×234). */
export const welcomeIntroduceScoreSectionVariants = tv({
  slots: {
    root: "relative mx-auto h-[min(52dvh,400px)] w-full max-w-screen-frame shrink-0",
    /** Clay phone; aspect matches `phone-frame.png` (540×1024). */
    phoneWrap:
      "pointer-events-none absolute bottom-0 left-1/2 z-0 h-full w-auto max-w-[69.333%] aspect-[540/1024] -translate-x-1/2",
    /** Solid black screen behind the transparent cutout. */
    phoneScreen: "absolute inset-[2.2%_5.2%_2.2%_5.2%] rounded-[14%] bg-black",
    phoneFrame:
      "pointer-events-none absolute inset-0 z-[1] h-full w-full select-none object-fill",
    /**
     * Card artboard is 375×294 with 26px side inset (324 content).
     * Floats over the upper-mid phone band (~Figma y=82 on 398 stage).
     */
    cardWrap:
      "absolute top-[12%] left-1/2 z-10 w-[min(100%,22.5rem)] -translate-x-1/2",
  },
});
