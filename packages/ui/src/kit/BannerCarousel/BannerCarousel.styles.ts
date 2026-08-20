import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const bannerCarouselVariants = tv({
  slots: {
    root: "relative w-full",
    viewport: "overflow-hidden rounded-3xl",
    track: "flex touch-pan-y",
    slide: "relative min-w-0 shrink-0 grow-0 basis-full",
    /** Embla scale/opacity tween target (`data-embla-tween`). */
    tween: "will-change-[transform,opacity]",
    pressable: [
      "block h-auto w-full min-w-0 rounded-3xl p-0",
      "data-[pressed=true]:scale-[0.99]",
    ].join(" "),
    image: "aspect-[2/1] w-full rounded-3xl object-cover",
    imagePlaceholder: "aspect-[2/1] w-full rounded-3xl bg-muted/40",
    dots: [
      "pointer-events-none absolute inset-x-0 bottom-3",
      "flex items-center justify-center gap-1.5",
    ].join(" "),
    dot: [
      "pointer-events-auto h-1.5 w-1.5 cursor-pointer rounded-full",
      "bg-white/50 transition-[width,background-color] duration-moderate ease-app",
    ].join(" "),
  },
  variants: {
    dotActive: {
      true: {
        dot: "w-4 bg-white",
      },
    },
  },
});

export type BannerCarouselVariantProps = VariantProps<
  typeof bannerCarouselVariants
>;
