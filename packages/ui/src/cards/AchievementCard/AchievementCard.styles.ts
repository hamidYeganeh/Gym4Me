import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const achievementCardVariants = tv({
  slots: {
    root: [
      "relative inline-flex shrink-0 items-center justify-center",
      "overflow-visible border-0 bg-transparent p-0 shadow-none",
      "text-[var(--achievement)]",
    ].join(" "),
    frame: "pointer-events-none absolute inset-0 size-full",
    framePath:
      "fill-[color-mix(in_oklch,var(--achievement)_16%,white)]",
    iconWrap: [
      "relative z-[1] flex items-center justify-center",
      /* Outline + design drop shadows on the glyph */
      "[filter:drop-shadow(0_0_0.75px_var(--background))_drop-shadow(0_0_0.75px_var(--background))_drop-shadow(0_0_1.25px_var(--background))_drop-shadow(0_6.67px_13.33px_#0F172A08)_drop-shadow(0_13.33px_26.67px_#0F172A05)]",
    ].join(" "),
    icon: "size-7 shrink-0 text-[var(--achievement)]",
    badge: [
      "absolute bottom-0 left-1/2 z-[2] -translate-x-1/2 translate-y-[35%]",
      "flex items-center justify-center text-[var(--achievement)]",
      "[filter:drop-shadow(0_2px_6px_color-mix(in_oklch,var(--achievement)_45%,transparent))]",
    ].join(" "),
    badgeIcon: "size-3.5 shrink-0",
  },
  variants: {
    variant: {
      polygon: {
        root: "h-[71px] w-[63px]",
      },
    },
    color: {
      accent: { root: "[--achievement:var(--accent)]" },
      danger: { root: "[--achievement:var(--danger)]" },
      success: { root: "[--achievement:var(--success)]" },
      warning: { root: "[--achievement:var(--warning)]" },
      red: { root: "[--achievement:var(--stats-red)]" },
      orange: { root: "[--achievement:var(--stats-orange)]" },
      blue: { root: "[--achievement:var(--stats-blue)]" },
      yellow: { root: "[--achievement:var(--stats-yellow)]" },
      purple: { root: "[--achievement:var(--stats-purple)]" },
    },
  },
  defaultVariants: {
    variant: "polygon",
    color: "accent",
  },
});

export type AchievementCardVariantProps = VariantProps<
  typeof achievementCardVariants
>;
