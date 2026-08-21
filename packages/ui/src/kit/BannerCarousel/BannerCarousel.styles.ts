import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

const titlePlacement = {
  "top-start": {
    titleWrap: "top-4 inset-inline-start-4 items-start text-start",
  },
  "top-center": {
    titleWrap: "top-4 inset-x-4 items-center text-center",
  },
  "top-end": {
    titleWrap: "top-4 inset-inline-end-4 items-end text-end",
  },
  "center-start": {
    titleWrap:
      "top-1/2 inset-inline-start-4 -translate-y-1/2 items-start text-start",
  },
  center: {
    titleWrap: "inset-0 items-center justify-center text-center",
  },
  "center-end": {
    titleWrap:
      "top-1/2 inset-inline-end-4 -translate-y-1/2 items-end text-end",
  },
  "bottom-start": {
    titleWrap: "bottom-4 inset-inline-start-4 items-start text-start",
  },
  "bottom-center": {
    titleWrap: "bottom-4 inset-x-4 items-center text-center",
  },
  "bottom-end": {
    titleWrap: "bottom-4 inset-inline-end-4 items-end text-end",
  },
} as const;

const actionPlacement = {
  "top-start": {
    actionWrap: "top-4 inset-inline-start-4 items-start text-start",
  },
  "top-center": {
    actionWrap: "top-4 inset-x-4 items-center text-center",
  },
  "top-end": {
    actionWrap: "top-4 inset-inline-end-4 items-end text-end",
  },
  "center-start": {
    actionWrap:
      "top-1/2 inset-inline-start-4 -translate-y-1/2 items-start text-start",
  },
  center: {
    actionWrap: "inset-0 items-center justify-center text-center",
  },
  "center-end": {
    actionWrap:
      "top-1/2 inset-inline-end-4 -translate-y-1/2 items-end text-end",
  },
  "bottom-start": {
    actionWrap: "bottom-4 inset-inline-start-4 items-start text-start",
  },
  "bottom-center": {
    actionWrap: "bottom-4 inset-x-4 items-center text-center",
  },
  "bottom-end": {
    actionWrap: "bottom-4 inset-inline-end-4 items-end text-end",
  },
} as const;

export const bannerCarouselVariants = tv({
  slots: {
    root: "relative w-full",
    viewport: "overflow-hidden w-full",
    slide: "relative min-w-0 !h-auto",
    /** Swiper scale/opacity tween target (`data-swiper-tween`). */
    tween: "relative will-change-[transform,opacity]",
    frame: "relative w-full overflow-hidden",
    pressable: [
      "block h-auto w-full min-w-0 p-0",
      "data-[pressed=true]:scale-[0.99]",
    ].join(" "),
    image: "absolute inset-0 size-full object-cover",
    imagePlaceholder: "absolute inset-0 size-full bg-muted/40",
    gradient: [
      "pointer-events-none absolute inset-0",
      "bg-[linear-gradient(180deg,transparent_28%,color-mix(in_oklab,var(--background)_55%,transparent)_72%,color-mix(in_oklab,var(--background)_88%,transparent)_100%)]",
    ].join(" "),
    titleWrap: "pointer-events-none absolute z-10 flex max-w-[78%] flex-col",
    title: [
      "text-balance text-lg font-bold leading-snug tracking-tight text-foreground",
      "drop-shadow-[0_1px_8px_color-mix(in_oklab,var(--background)_55%,transparent)]",
    ].join(" "),
    actionWrap: "absolute z-20 flex max-w-[78%] flex-col",
    action: "h-10 min-w-0 rounded-2xl px-4 font-semibold shadow-none",
    dots: [
      "pointer-events-none absolute inset-x-0 bottom-3 z-30",
      "flex items-center justify-center gap-1.5",
    ].join(" "),
    dot: [
      "pointer-events-auto h-1.5 w-1.5 cursor-pointer rounded-full",
      "bg-white/50 transition-[width,background-color] duration-moderate ease-app",
    ].join(" "),
  },
  variants: {
    aspectRatio: {
      "16/9": { frame: "aspect-[16/9]" },
      "2/1": { frame: "aspect-[2/1]" },
      "4/3": { frame: "aspect-[4/3]" },
      "1/1": { frame: "aspect-square" },
    },
    fullBleed: {
      true: {
        root: "-mx-screen max-w-none",
      },
    },
    radius: {
      none: {
        frame: "rounded-none",
        pressable: "rounded-none",
      },
      sm: {
        frame: "rounded-[var(--radius)]",
        pressable: "rounded-[var(--radius)]",
      },
      field: {
        frame: "rounded-[var(--field-radius)]",
        pressable: "rounded-[var(--field-radius)]",
      },
      compact: {
        frame: "rounded-[var(--surface-radius-compact)]",
        pressable: "rounded-[var(--surface-radius-compact)]",
      },
      auth: {
        frame: "rounded-[var(--auth-field-radius)]",
        pressable: "rounded-[var(--auth-field-radius)]",
      },
      surface: {
        frame: "rounded-[var(--surface-radius)]",
        pressable: "rounded-[var(--surface-radius)]",
      },
      full: {
        frame: "rounded-full",
        pressable: "rounded-full",
      },
    },
    titlePlacement,
    actionPlacement,
    dotActive: {
      true: {
        dot: "w-4 bg-white",
      },
    },
  },
  defaultVariants: {
    aspectRatio: "16/9",
    radius: "surface",
    fullBleed: false,
    titlePlacement: "bottom-start",
    actionPlacement: "bottom-end",
  },
});

export type BannerCarouselVariantProps = VariantProps<
  typeof bannerCarouselVariants
>;
