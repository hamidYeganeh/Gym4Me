import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const muscleCardVariants = tv({
  slots: {
    root: [
      // Override ToggleButton defaults (h-10, inline-flex, padding, svg size, etc.)
      "relative !flex !h-[128px] !w-[88px] shrink-0 items-stretch justify-stretch !gap-0",
      "overflow-hidden !rounded-2xl border border-solid border-border !p-0 shadow-none",
      "text-surface-foreground whitespace-normal",
      // Lock HeroUI ToggleButton color tokens to surface / accent
      "[--toggle-button-bg:var(--surface)]",
      "[--toggle-button-bg-hover:var(--surface)]",
      "[--toggle-button-bg-pressed:var(--surface)]",
      "[--toggle-button-bg-selected:color-mix(in_oklch,var(--accent)_10%,var(--surface))]",
      "[--toggle-button-bg-selected-hover:color-mix(in_oklch,var(--accent)_10%,var(--surface))]",
      "[--toggle-button-bg-selected-pressed:color-mix(in_oklch,var(--accent)_10%,var(--surface))]",
      "[--toggle-button-fg:var(--surface-foreground)]",
      "[--toggle-button-fg-selected:var(--surface-foreground)]",
      // Anatomy fills (inherited by inline SVG)
      "[--muscle-highlight:var(--muted)]",
      "[--muscle-body:var(--border)]",
      "[--muscle-base:var(--surface-secondary)]",
      "data-[selected=true]:border-accent",
      "data-[selected=true]:[--muscle-highlight:var(--accent)]",
      "data-[selected=true]:[--muscle-body:color-mix(in_oklch,var(--accent)_35%,var(--surface))]",
      "data-[selected=true]:[--muscle-base:color-mix(in_oklch,var(--accent)_12%,var(--surface))]",
      "transition-[background-color,border-color,transform] duration-fast ease-app",
      "outline-none data-[pressed=true]:!scale-[0.98]",
      // Kill ToggleButton’s default svg sizing on the anatomy art
      "[&_svg]:!m-0 [&_svg]:!size-full [&_svg]:!max-w-none [&_svg]:shrink",
    ].join(" "),
    media: "pointer-events-none absolute inset-0 overflow-hidden",
    art: "absolute block size-full max-w-none select-none [&_svg]:block [&_svg]:size-full",
    image:
      "pointer-events-none absolute inset-0 size-full object-cover select-none",
  },
});

export type MuscleCardVariantProps = VariantProps<typeof muscleCardVariants>;
