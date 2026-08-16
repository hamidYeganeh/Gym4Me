import { tv } from "tailwind-variants";

export const discoveryHomeMapCtaSectionVariants = tv({
  slots: {
    root: [
      "relative isolate overflow-hidden rounded-[2rem]",
      "min-h-[14.5rem] border border-border/60 bg-surface-secondary",
      "text-start shadow-none",
      "transition-transform duration-fast ease-app",
      "data-[pressed=true]:scale-[0.985]",
    ].join(" "),
    grid: [
      "pointer-events-none absolute inset-0 opacity-[0.35]",
      "bg-[radial-gradient(circle_at_1px_1px,color-mix(in_oklab,var(--foreground)_28%,transparent)_1px,transparent_0)]",
      "[background-size:18px_18px]",
    ].join(" "),
    glow: [
      "pointer-events-none absolute -end-10 -top-12 size-40 rounded-full",
      "bg-accent/35 blur-3xl",
    ].join(" "),
    pin: [
      "pointer-events-none absolute end-6 top-6",
      "flex size-11 items-center justify-center rounded-full",
      "bg-accent text-accent-foreground",
      "shadow-[0_10px_24px_color-mix(in_oklab,var(--accent)_45%,transparent)]",
    ].join(" "),
    content: "relative z-10 flex min-h-[14.5rem] flex-col justify-end gap-3 p-5",
    copy: "flex max-w-[18rem] flex-col gap-1.5",
    eyebrow: "text-accent tracking-wide",
    title: "text-balance text-[1.65rem] leading-tight tracking-tight text-foreground",
    subtitle: "text-pretty leading-relaxed text-muted",
    ctaHint: "text-sm font-semibold text-foreground",
  },
});
