import { tv } from "tailwind-variants";

/** Activities stage — Apple Watch Ultra center + fan of three activity cards. */
export const welcomeIntroduceActivitiesSectionVariants = tv({
  slots: {
    root: "relative mx-auto h-[min(48dvh,22.5rem)] w-full max-w-[23rem] shrink-0 overflow-visible",
    watchWrap:
      "pointer-events-none absolute inset-x-[12%] bottom-[-6%] top-[8%] z-[5]",
    watchImage:
      "pointer-events-none h-full w-full select-none object-contain object-bottom drop-shadow-[0_24px_48px_rgba(249,115,22,0.22)]",
    card: "absolute w-[8.25rem] will-change-transform",
    /** Top-left — Cycling / Light */
    cycling: "top-[2%] start-[0%] z-20",
    /** Bottom-left — Kickboxing / Calm */
    kickboxing: "bottom-[4%] start-[4%] z-10",
    /** Bottom-right — Swimming / Intense */
    swimming: "bottom-[10%] end-[-2%] z-30",
  },
});
