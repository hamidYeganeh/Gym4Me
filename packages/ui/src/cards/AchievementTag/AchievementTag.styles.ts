import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const achievementTagVariants = tv({
  slots: {
    root: [
      "relative inline-flex shrink-0 items-center justify-center",
      "overflow-visible border-0 bg-transparent p-0 shadow-none",
      "text-[var(--achievement)]",
      "[--tag-outer:color-mix(in_oklch,var(--achievement)_42%,#a1a1aa)]",
      "[--tag-inner:color-mix(in_oklch,var(--achievement)_62%,#3f3f46)]",
    ].join(" "),
    frame: "pointer-events-none absolute inset-0 size-full",
    iconWrap: ["relative z-[1] flex items-center justify-center"].join(" "),
    icon: "size-5 shrink-0 text-white",
    badge:
      "absolute bottom-0 left-1/2 z-[2] -translate-x-1/2 flex items-center justify-center text-white",
    badgeIcon: "size-3 shrink-0",
  },
  variants: {
    variant: {
      polygon: {
        root: "h-[54px] w-[49px]",
        badge: "translate-y-[30%]",
      },
      circular: {
        root: "h-[52px] w-[51px]",
        badge: "translate-y-[18%]",
      },
      wavy: {
        root: "h-[52px] w-[52px]",
        badge: "translate-y-[20%]",
      },
      shield1: {
        root: "h-[53px] w-[48px]",
        badge: "translate-y-[28%]",
      },
      shield2: {
        root: "h-[53px] w-[49px]",
        badge: "translate-y-[28%]",
      },
      octagon: {
        root: "h-[51px] w-[49px]",
        badge: "translate-y-[18%]",
      },
      diamond: {
        root: "h-[58px] w-[58px]",
        badge: "translate-y-[12%]",
      },
      star1: {
        root: "h-[56px] w-[50px]",
        badge: "translate-y-[18%]",
      },
      star2: {
        root: "h-[55px] w-[55px]",
        badge: "translate-y-[14%]",
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

export type AchievementTagVariantProps = VariantProps<
  typeof achievementTagVariants
>;
