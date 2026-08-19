import { tv } from "tailwind-variants";

export const onboardingSavingSectionVariants = tv({
  slots: {
    root: [
      "relative flex h-dvh min-h-dvh w-full flex-col overflow-hidden",
      "bg-background text-foreground",
    ],
    glow: [
      "pointer-events-none absolute inset-x-0 bottom-0 z-0",
      "h-[min(48vh,26rem)]",
      "bg-[radial-gradient(ellipse_at_bottom,color-mix(in_oklch,var(--warning)_42%,transparent)_0%,transparent_72%)]",
    ],
    stage: [
      "relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center",
      "px-6",
    ],
    list: "m-0 flex w-full max-w-sm list-none flex-col items-center gap-5 p-0",
    row: "flex w-full items-center justify-center gap-2",
    label: "text-center text-[1.15rem] leading-snug tracking-tight sm:text-xl",
    checkSlot: "flex size-5 shrink-0 items-center justify-center",
    checkIcon: "size-4",
    footer: [
      "relative z-10 flex flex-col items-center gap-4",
      "px-6 pb-[max(2.25rem,env(safe-area-inset-bottom))]",
    ],
    error: "max-w-xs text-center text-sm leading-6",
    retry: "min-w-40",
    brand: "relative flex items-center justify-center",
    brandGlow: [
      "pointer-events-none absolute size-28 rounded-full",
      "bg-[radial-gradient(circle,color-mix(in_oklch,var(--warning)_55%,transparent)_0%,transparent_70%)]",
      "blur-md",
    ],
    mark: "relative text-warning",
  },
  variants: {
    status: {
      pending: {
        label: "text-muted/50",
      },
      active: {
        label: "font-semibold text-foreground",
      },
      done: {
        label: "text-muted",
        checkIcon: "text-accent",
      },
      error: {
        label: "font-semibold text-danger",
      },
    },
  },
  defaultVariants: {
    status: "pending",
  },
});
