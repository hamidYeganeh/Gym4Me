import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const achievementTagVariants = tv({
  slots: {
    root: [
      // Neutralize HeroUI Card defaults (flex-col / gap-3 / p-4) that fight badge layout.
      "relative inline-flex shrink-0 flex-row items-center justify-center gap-0",
      "overflow-visible border-0 bg-transparent p-0 shadow-none",
      "text-[var(--achievement)]",
      "[--tag-outer:color-mix(in_oklch,var(--achievement)_42%,#a1a1aa)]",
      "[--tag-inner:color-mix(in_oklch,var(--achievement)_62%,#3f3f46)]",
    ].join(" "),
    frame: "pointer-events-none absolute inset-0 size-full",
    // Frame SVGs reserve bottom space for drop shadows, so the painted badge sits
    // ~2px above the box center — nudge the icon to match that visual center.
    iconWrap: [
      "pointer-events-none absolute inset-0 z-[1]",
      "flex items-center justify-center",
      "translate-y-[calc(-2px*var(--tag-scale))]",
      "[&_svg]:shrink-0 [&_svg]:text-white",
      "[&_svg]:!size-[length:var(--tag-icon-size)]",
    ].join(" "),
    icon: "shrink-0 text-white",
    badge:
      "absolute bottom-0 left-1/2 z-[2] -translate-x-1/2 flex items-center justify-center text-white",
    badgeIcon:
      "shrink-0 [&_svg]:!size-[length:var(--tag-badge-size)]",
  },
  variants: {
    variant: {
      polygon: {
        root: "h-[calc(54px*var(--tag-scale))] w-[calc(49px*var(--tag-scale))]",
        badge: "translate-y-[30%]",
      },
      circular: {
        root: "h-[calc(52px*var(--tag-scale))] w-[calc(51px*var(--tag-scale))]",
        badge: "translate-y-[18%]",
      },
      wavy: {
        root: "h-[calc(52px*var(--tag-scale))] w-[calc(52px*var(--tag-scale))]",
        badge: "translate-y-[20%]",
      },
      shield1: {
        root: "h-[calc(53px*var(--tag-scale))] w-[calc(48px*var(--tag-scale))]",
        badge: "translate-y-[28%]",
      },
      shield2: {
        root: "h-[calc(53px*var(--tag-scale))] w-[calc(49px*var(--tag-scale))]",
        badge: "translate-y-[28%]",
      },
      octagon: {
        root: "h-[calc(51px*var(--tag-scale))] w-[calc(49px*var(--tag-scale))]",
        badge: "translate-y-[18%]",
      },
      diamond: {
        root: "h-[calc(58px*var(--tag-scale))] w-[calc(58px*var(--tag-scale))]",
        badge: "translate-y-[12%]",
      },
      star1: {
        root: "h-[calc(56px*var(--tag-scale))] w-[calc(50px*var(--tag-scale))]",
        badge: "translate-y-[18%]",
      },
      star2: {
        root: "h-[calc(55px*var(--tag-scale))] w-[calc(55px*var(--tag-scale))]",
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
      green: { root: "[--achievement:var(--stats-green)]" },
      navy: { root: "[--achievement:var(--stats-navy)]" },
      midnight: { root: "[--achievement:var(--stats-midnight)]" },
      rose: { root: "[--achievement:var(--stats-rose)]" },
      forest: { root: "[--achievement:var(--stats-forest)]" },
    },
    size: {
      sm: {
        root: "[--tag-scale:0.75] [--tag-icon-size:15px] [--tag-badge-size:9px]",
      },
      md: {
        root: "[--tag-scale:1] [--tag-icon-size:20px] [--tag-badge-size:12px]",
      },
      lg: {
        root: "[--tag-scale:1.35] [--tag-icon-size:27px] [--tag-badge-size:16px]",
      },
    },
  },
  defaultVariants: {
    variant: "polygon",
    color: "accent",
    size: "md",
  },
});

export type AchievementTagVariantProps = VariantProps<
  typeof achievementTagVariants
>;
