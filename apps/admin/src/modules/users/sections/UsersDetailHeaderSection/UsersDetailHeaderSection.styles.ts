import { tv } from "tailwind-variants";

export const usersDetailHeaderSectionVariants = tv({
  slots: {
    root: "overflow-hidden rounded-2xl border border-border bg-surface shadow-sm",
    banner:
      "relative h-40 w-full bg-[linear-gradient(135deg,#ff8a3d_0%,#ff6b00_42%,#e85d04_100%)] sm:h-48",
    bannerGlow:
      "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.35),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.2),transparent_40%)]",
    bannerEdit:
      "absolute end-4 top-4 z-10 size-10 min-w-10 rounded-full bg-white text-foreground shadow-md",
    body: "relative px-5 pb-6 pt-0 sm:px-8 sm:pb-8",
    avatarWrap:
      "absolute start-5 top-0 z-10 -translate-y-1/2 sm:start-8",
    avatar:
      "size-24 border-4 border-surface shadow-md sm:size-28",
    avatarFallback: "text-lg font-semibold sm:text-xl",
    row: "flex flex-col gap-5 pt-14 sm:flex-row sm:items-end sm:justify-between sm:pt-16",
    identity: "min-w-0",
    nameRow: "flex flex-wrap items-center gap-2.5",
    name: "text-xl font-bold tracking-tight text-foreground sm:text-2xl",
    badge:
      "rounded-md border border-warning/40 bg-warning/10 px-2.5 py-0.5 text-xs font-semibold text-warning",
    contact: "mt-1.5 text-sm text-muted",
    actions: "flex shrink-0 flex-wrap items-center gap-3",
    shareButton: "bg-foreground text-background hover:opacity-90",
  },
});
