import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const muscleCardVariants = tv({
  slots: {
    root: [
      // Override ToggleButton defaults (h-10, inline-flex, padding, svg size, etc.)
      "relative !flex !h-[128px] !w-[88px] shrink-0 items-stretch justify-stretch !gap-0",
      "overflow-hidden !rounded-[16px] border border-solid border-border !p-0 shadow-none",
      "text-surface-foreground whitespace-normal",
      // Plate: white idle → accent wash when selected
      "[--toggle-button-bg:var(--surface)]",
      "[--toggle-button-bg-hover:var(--surface)]",
      "[--toggle-button-bg-pressed:var(--surface)]",
      "[--toggle-button-bg-selected:color-mix(in_oklch,var(--accent)_28%,var(--surface))]",
      "[--toggle-button-bg-selected-hover:color-mix(in_oklch,var(--accent)_28%,var(--surface))]",
      "[--toggle-button-bg-selected-pressed:color-mix(in_oklch,var(--accent)_28%,var(--surface))]",
      "[--toggle-button-fg:var(--surface-foreground)]",
      "[--toggle-button-fg-selected:var(--surface-foreground)]",
      // Idle = zinc sample; selected = full accent fill + foreground-mixed strokes
      // (accent is ~L87 lime — diluting with surface washes it out in light mode)
      "[--muscle-surface:var(--surface)]",
      "[--muscle-body:var(--surface-secondary)]",
      "[--muscle-highlight:var(--default)]",
      "[--muscle-stroke:var(--muted)]",
      "[--muscle-stroke-strong:color-mix(in_oklch,var(--foreground)_55%,var(--muted))]",
      "data-[selected=true]:border-[color-mix(in_oklch,var(--accent)_58%,var(--foreground))]",
      "data-[selected=true]:[--muscle-surface:var(--surface)]",
      "data-[selected=true]:[--muscle-body:color-mix(in_oklch,var(--accent)_32%,var(--surface))]",
      "data-[selected=true]:[--muscle-highlight:var(--accent)]",
      "data-[selected=true]:[--muscle-stroke:color-mix(in_oklch,var(--accent)_52%,var(--foreground))]",
      "data-[selected=true]:[--muscle-stroke-strong:color-mix(in_oklch,var(--accent)_68%,var(--foreground))]",
      "transition-[background-color,border-color,transform] duration-fast ease-app",
      "outline-none data-[pressed=true]:!scale-[0.98]",
      // Kill ToggleButton’s default svg sizing on the anatomy art
      "[&_svg]:!m-0 [&_svg]:!size-full [&_svg]:!max-w-none [&_svg]:shrink",
    ].join(" "),
    media: "pointer-events-none absolute inset-0 overflow-hidden",
    art: "absolute inset-0 block size-full max-w-none select-none [&_svg]:block [&_svg]:size-full",
    image:
      "pointer-events-none absolute inset-0 size-full object-cover select-none",
  },
});

export type MuscleCardVariantProps = VariantProps<typeof muscleCardVariants>;
