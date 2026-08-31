import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const discoveryHomeMapCtaSectionVariants = tv({
  slots: {
    root: "px-screen",
    pressable: [
      "group relative flex !h-auto w-full flex-col items-stretch gap-5",
      "rounded-[1.5rem] border border-border/80 bg-surface p-5 text-center shadow-none",
      "transition-transform duration-fast ease-app",
      "data-[hovered=true]:bg-surface data-[hovered=true]:opacity-[0.98]",
      "data-[pressed=true]:scale-[0.99]",
      "[&.button--lg]:!h-auto [&.button--md]:!h-auto",
    ].join(" "),
    copy: "flex w-full shrink-0 flex-col items-center gap-2 text-center",
    title:
      "w-full max-w-[19rem] text-balance text-xl leading-tight font-bold tracking-tight text-foreground",
    subtitle:
      "w-full max-w-[21rem] text-pretty text-sm leading-normal text-muted",
    mapFrame: [
      "relative isolate aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl",
      "bg-surface-secondary",
    ].join(" "),
    mapImage: "pointer-events-none object-cover object-center",
    mapFade:
      "pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[58%] [contain:paint]",
    mapBlur: "pointer-events-none absolute inset-0 rounded-[inherit]",
    mapWash: "absolute inset-0 rounded-[inherit]",
    ctaPill: [
      "pointer-events-none absolute bottom-4 inset-x-0 z-10 mx-auto w-fit max-w-[calc(100%-2rem)]",
      "inline-flex items-center gap-2 rounded-full px-5 py-2.5",
      "text-sm font-semibold",
    ].join(" "),
    ctaIcon: "size-4 shrink-0 opacity-95",
  },
  variants: {
    colorScheme: {
      light: {
        mapWash: [
          "bg-[linear-gradient(to_top,var(--surface)_0%,color-mix(in_oklch,var(--surface)_78%,transparent)_30%,color-mix(in_oklch,var(--surface)_32%,transparent)_58%,transparent_78%)]",
        ].join(" "),
        ctaPill: [
          "bg-foreground text-background",
          "shadow-[0_6px_18px_color-mix(in_oklch,var(--foreground)_22%,transparent)]",
        ].join(" "),
      },
      dark: {
        mapWash: [
          "bg-[linear-gradient(to_top,var(--background)_0%,color-mix(in_oklch,var(--background)_72%,transparent)_32%,color-mix(in_oklch,var(--background)_28%,transparent)_58%,transparent_78%)]",
        ].join(" "),
        ctaPill: [
          "bg-foreground text-background",
          "shadow-[0_8px_22px_color-mix(in_oklch,var(--foreground)_18%,transparent)]",
        ].join(" "),
      },
    },
  },
  defaultVariants: {
    colorScheme: "light",
  },
});

export type DiscoveryHomeMapCtaSectionVariants = VariantProps<
  typeof discoveryHomeMapCtaSectionVariants
>;
