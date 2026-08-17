import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const workoutCardVariants = tv({
  slots: {
    root: [
      "relative h-[150px] w-[260px] overflow-hidden rounded-[24px] p-3",
      "border-0 bg-surface",
    ].join(" "),
    image:
      "pointer-events-none absolute inset-0 size-full object-cover object-right select-none",
    scrim: [
      "pointer-events-none absolute inset-0",
      "bg-linear-to-t from-surface via-surface/35 to-transparent",
    ].join(" "),
    body: "relative z-10 flex h-full min-h-0 flex-col justify-between",
    category: [
      "h-7 max-w-full rounded-full border-0 px-2.5",
      "backdrop-blur-md",
      "[--chip-bg:color-mix(in_oklch,var(--foreground)_55%,transparent)]",
      "[--chip-fg:var(--background)]",
      "[&_.chip__label]:truncate [&_.chip__label]:font-semibold",
    ].join(" "),
    bottom: "flex items-end justify-between gap-2",
    info: "flex min-w-0 flex-1 flex-col gap-1",
    title: "truncate leading-tight tracking-tight text-foreground",
    meta: "flex min-w-0 items-center gap-1.5 text-muted",
    metaItem: "inline-flex min-w-0 items-center gap-1",
    metaIcon: "size-3.5 shrink-0",
    metaText: "truncate text-xs font-medium",
    metaSeparator: "shrink-0 text-xs leading-none",
    play: [].join(" "),
  },
});

export type WorkoutCardVariantProps = VariantProps<typeof workoutCardVariants>;
