import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const scheduleWorkoutCardVariants = tv({
  slots: {
    root: "relative w-full touch-pan-y overflow-hidden",
    actions:
      "absolute inset-y-0 end-0 z-0 flex items-center justify-center pe-1",
    panel: [
      "relative z-10 flex w-full cursor-grab items-center gap-3",
      "rounded-[22px] border border-border bg-surface px-3 py-3",
      "text-start shadow-[0_8px_24px_color-mix(in_oklch,var(--foreground)_6%,transparent)]",
      "active:cursor-grabbing touch-pan-y select-none",
    ].join(" "),
    thumb:
      "relative size-14 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface-secondary",
    thumbImage: "size-full object-cover",
    body: "flex min-w-0 flex-1 flex-col gap-0.5",
    title: "truncate text-[15px] leading-tight tracking-tight text-foreground",
    meta: "truncate text-sm leading-snug text-muted",
    intensity: "mt-1 inline-flex items-center gap-1 text-sm font-medium",
    intensityIcon: "size-3.5 shrink-0",
    trailing: "relative z-20 flex shrink-0 items-center self-center",
    chevron: "size-4 shrink-0 text-muted",
  },
  variants: {
    intensity: {
      intense: {
        intensity: "text-warning",
      },
      normal: {
        intensity: "text-accent",
      },
      extreme: {
        intensity: "text-danger",
      },
    },
  },
});

export type ScheduleWorkoutCardVariantProps = VariantProps<
  typeof scheduleWorkoutCardVariants
>;
