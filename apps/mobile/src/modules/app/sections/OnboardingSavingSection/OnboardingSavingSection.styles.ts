import { tv } from "tailwind-variants";

export const onboardingSavingSectionVariants = tv({
  slots: {
    root: [
      "relative flex h-dvh min-h-dvh w-full flex-col overflow-hidden",
      "bg-background text-foreground",
    ],
    media: "pointer-events-none absolute inset-0 z-0",
    image: "object-cover object-center size-full",
    mediaScrim: [
      "absolute inset-0",
      "bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--background)_72%,transparent)_0%,color-mix(in_oklch,var(--background)_55%,transparent)_42%,color-mix(in_oklch,var(--background)_88%,transparent)_100%)]",
    ],
    glow: [
      "pointer-events-none absolute inset-x-0 bottom-0 z-[1]",
      "h-[min(52vh,28rem)]",
      "bg-[radial-gradient(ellipse_at_bottom,color-mix(in_oklch,var(--accent)_28%,transparent)_0%,transparent_72%)]",
    ],
    stage: [
      "relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center",
      "px-6",
    ],
    panel: "flex w-full max-w-sm flex-col items-stretch gap-3",
    headline: "mb-1 flex flex-wrap items-baseline justify-center gap-x-2 text-center",
    headlinePrefix: "font-medium tracking-tight",
    headlineWord:
      "text-2xl font-bold tracking-tight text-accent sm:text-3xl",
    list: "m-0 flex w-full list-none flex-col items-stretch gap-3 p-0",
    row: [
      "flex w-full items-center gap-3 rounded-2xl px-3.5 py-3.5",
      "bg-background/70 backdrop-blur-md",
    ],
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
        statusSlot: "bg-default/80 text-muted",
        label: "text-muted",
      },
      active: {
        statusSlot: "bg-accent/15 text-accent",
        label: "font-semibold text-foreground",
      },
      done: {
        statusSlot: "bg-accent text-accent-foreground",
        checkIcon: "text-accent-foreground",
        label: "text-foreground/80",
      },
      error: {
        statusSlot: "bg-danger/15 text-danger",
        label: "font-semibold text-danger",
      },
    },
  },
  defaultVariants: {
    status: "pending",
  },
});
