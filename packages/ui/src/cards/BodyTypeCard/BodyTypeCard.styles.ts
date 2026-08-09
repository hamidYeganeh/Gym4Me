import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const bodyTypeCardVariants = tv({
  slots: {
    root: [
      // Override ToggleButton defaults — framed 130×360 Figma art
      "relative !flex !h-[360px] !w-[130px] shrink-0 items-stretch justify-stretch !gap-0",
      "overflow-hidden !rounded-2xl border border-solid border-border !p-0 shadow-none",
      "text-surface-foreground whitespace-normal",
      "[--toggle-button-bg:var(--surface)]",
      "[--toggle-button-bg-hover:var(--surface)]",
      "[--toggle-button-bg-pressed:var(--surface)]",
      "[--toggle-button-bg-selected:color-mix(in_oklch,var(--accent)_28%,var(--surface))]",
      "[--toggle-button-bg-selected-hover:color-mix(in_oklch,var(--accent)_28%,var(--surface))]",
      "[--toggle-button-bg-selected-pressed:color-mix(in_oklch,var(--accent)_28%,var(--surface))]",
      "[--toggle-button-fg:var(--surface-foreground)]",
      "[--toggle-button-fg-selected:var(--surface-foreground)]",
      // Accent-tinted idle; selected = stronger fill + foreground-mixed strokes
      // (accent is ~L87 lime — diluting with surface washes it out in light mode)
      "[--body-type-body:color-mix(in_oklch,var(--accent)_12%,var(--surface))]",
      "[--body-type-stroke:color-mix(in_oklch,var(--accent)_35%,var(--border))]",
      "data-[selected=true]:border-[color-mix(in_oklch,var(--accent)_58%,var(--foreground))]",
      "data-[selected=true]:[--body-type-body:var(--accent)]",
      "data-[selected=true]:[--body-type-stroke:color-mix(in_oklch,var(--accent)_68%,var(--foreground))]",
      "transition-[background-color,border-color,transform] duration-fast ease-app",
      "outline-none data-[pressed=true]:!scale-[0.98]",
      "[&_svg]:!m-0 [&_svg]:!size-full [&_svg]:!max-w-none [&_svg]:shrink",
    ].join(" "),
    media: "pointer-events-none absolute inset-0 overflow-hidden",
    art: "absolute inset-0 block size-full max-w-none select-none [&_svg]:block [&_svg]:size-full",
    image:
      "pointer-events-none absolute inset-0 size-full object-cover select-none",
  },
});

export type BodyTypeCardVariantProps = VariantProps<typeof bodyTypeCardVariants>;
