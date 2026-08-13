import { tv } from "tailwind-variants";

export const welcomeIntroduceMealsSectionVariants = tv({
  slots: {
    root: "relative mx-auto h-[min(42dvh,20rem)] w-full max-w-[26rem] shrink-0 overflow-hidden",
    grid: "absolute inset-0 flex flex-col items-center justify-center gap-3",
    row: "flex gap-3",
    rowOffset: "translate-x-4",
    rowOffsetAlt: "-translate-x-6",
    tile: [
      "size-24 overflow-hidden rounded-[1.75rem]",
      "shadow-[0_12px_28px_color-mix(in_oklch,var(--foreground)_14%,transparent)]",
      "ring-1 ring-white/10",
    ],
    t0: "bg-[linear-gradient(145deg,#fde68a,#f59e0b)]",
    t1: "bg-[linear-gradient(145deg,#bbf7d0,#16a34a)]",
    t2: "bg-[linear-gradient(145deg,#fecaca,#ef4444)]",
    t3: "bg-[linear-gradient(145deg,#ddd6fe,#7c3aed)]",
    t4: "bg-[linear-gradient(145deg,#bae6fd,#0284c7)]",
    t5: "bg-[linear-gradient(145deg,#fed7aa,#ea580c)]",
    t6: "bg-[linear-gradient(145deg,#fbcfe8,#db2777)]",
    t7: "bg-[linear-gradient(145deg,#a7f3d0,#0d9488)]",
    t8: "bg-[linear-gradient(145deg,#e7e5e4,#78716c)]",
    t9: "bg-[linear-gradient(145deg,#fef08a,#ca8a04)]",
    t10: "bg-[linear-gradient(145deg,#c7d2fe,#4f46e5)]",
    glow: [
      "pointer-events-none absolute inset-x-8 bottom-0 h-24",
      "bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--accent)_35%,transparent),transparent_70%)]",
    ],
  },
});
