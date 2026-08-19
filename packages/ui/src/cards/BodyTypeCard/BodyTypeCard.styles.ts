import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const bodyTypeCardVariants = tv({
  slots: {
    root: [
      // Override ToggleButton defaults — framed 130×360 Figma art
      "relative !flex !h-[360px] !w-[130px] shrink-0 items-stretch justify-stretch !gap-0",
      "overflow-hidden !rounded-2xl border border-solid !p-0 shadow-none",
      "text-surface-foreground whitespace-normal",
      "[--toggle-button-bg:transparent]",
      "[--toggle-button-bg-hover:transparent]",
      "[--toggle-button-bg-pressed:transparent]",
      "[--toggle-button-bg-selected:transparent]",
      "[--toggle-button-bg-selected-hover:transparent]",
      "[--toggle-button-bg-selected-pressed:transparent]",
      "[--toggle-button-fg:var(--surface-foreground)]",
      "[--toggle-button-fg-selected:var(--surface-foreground)]",
      "transition-[background-color,border-color,transform] duration-fast ease-app",
      "outline-none data-[pressed=true]:!scale-[0.98]",
      "[&_svg]:!m-0 [&_svg]:!size-full [&_svg]:!max-w-none [&_svg]:shrink",
    ].join(" "),
    media: "pointer-events-none absolute inset-0 overflow-hidden",
    art: "absolute inset-0 block size-full max-w-none select-none [&_svg]:block [&_svg]:size-full",
    image:
      "pointer-events-none absolute inset-0 size-full object-cover select-none",
  },
  variants: {
    selected: {
      false: {
        root: [
          "border-border",
          // Idle: soft muted figure
          "[--body-type-body:color-mix(in_oklch,var(--foreground)_06%,var(--surface))]",
          "[--body-type-body-soft:color-mix(in_oklch,var(--foreground)_03%,var(--surface))]",
          "[--body-type-stroke:color-mix(in_oklch,var(--foreground)_28%,var(--border))]",
        ].join(" "),
      },
      true: {
        root: [
          // Active Figma palette — #DBEAFE / #EFF6FF / #2563EB
          "border-[#2563EB]",
          "[--body-type-body:#DBEAFE]",
          "[--body-type-body-soft:#EFF6FF]",
          "[--body-type-stroke:#2563EB]",
        ].join(" "),
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});

export type BodyTypeCardVariantProps = VariantProps<
  typeof bodyTypeCardVariants
>;
