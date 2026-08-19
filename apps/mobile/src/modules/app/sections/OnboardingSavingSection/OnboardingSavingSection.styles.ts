import { tv } from "tailwind-variants";

export const onboardingSavingSectionVariants = tv({
  slots: {
    root: [
      "relative flex h-dvh min-h-dvh w-full flex-col overflow-hidden",
      "bg-background text-foreground",
    ],
    glow: [
      "pointer-events-none absolute inset-x-0 bottom-0 z-0",
      "h-[min(52vh,28rem)]",
      "bg-[radial-gradient(ellipse_at_bottom,color-mix(in_oklch,var(--accent)_38%,transparent)_0%,transparent_72%)]",
    ],
    stage: [
      "relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center",
      "px-6",
    ],
    card: [
      "flex w-full max-w-sm flex-col items-center gap-6",
      "rounded-[1.75rem] border border-accent/20 bg-default/60 px-5 py-7",
      "shadow-[0_18px_48px_color-mix(in_oklch,var(--accent)_12%,transparent)]",
      "backdrop-blur-md",
    ],
    progressWrap: "flex flex-col items-center gap-3",
    progress: "size-16 text-accent",
    list: "m-0 flex w-full list-none flex-col items-stretch gap-3 p-0",
    row: "flex w-full items-center gap-3 rounded-2xl bg-background/55 px-3.5 py-3",
    statusSlot:
      "flex size-8 shrink-0 items-center justify-center rounded-full",
    checkIcon: "size-4",
    label: "min-w-0 flex-1 text-start text-[0.95rem] leading-snug tracking-tight",
    footer: [
      "relative z-10 flex flex-col items-center gap-4",
      "px-6 pb-[max(2.25rem,env(safe-area-inset-bottom))]",
    ],
    error: "max-w-xs text-center text-sm leading-6",
    retry: "min-w-40",
    brand: "relative flex items-center justify-center",
    brandGlow: [
      "pointer-events-none absolute size-28 rounded-full",
      "bg-[radial-gradient(circle,color-mix(in_oklch,var(--accent)_50%,transparent)_0%,transparent_70%)]",
      "blur-md",
    ],
    mark: "relative text-accent",
  },
  variants: {
    status: {
      pending: {
        statusSlot: "bg-default text-muted",
        label: "text-muted",
      },
      active: {
        statusSlot: "bg-accent/15 text-accent ring-1 ring-accent/40",
        label: "font-semibold text-foreground",
      },
      done: {
        statusSlot: "bg-accent text-accent-foreground",
        checkIcon: "text-accent-foreground",
        label: "text-foreground/80",
      },
      error: {
        statusSlot: "bg-danger/15 text-danger ring-1 ring-danger/35",
        label: "font-semibold text-danger",
      },
    },
  },
  defaultVariants: {
    status: "pending",
  },
});
