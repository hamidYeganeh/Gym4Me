import { tv } from "tailwind-variants";

export const welcomeIntroduceChatSectionVariants = tv({
  slots: {
    root: "mx-auto flex w-full max-w-[21.5rem] shrink-0 flex-col gap-2",
    rowOut: "flex items-start justify-end gap-2",
    rowIn: "flex items-start justify-start gap-2",
    avatar:
      "mt-0.5 size-9 shrink-0 overflow-hidden rounded-full bg-accent/20 text-[0.7rem] font-bold text-accent ring-2 ring-surface",
    avatarInner: "flex size-full items-center justify-center",
    bubbleOut: [
      "max-w-[17.8rem] rounded-[1.25rem] rounded-se-md bg-accent px-2.5 py-2.5",
      "text-accent-foreground shadow-[0_8px_24px_color-mix(in_oklch,var(--accent)_28%,transparent)]",
    ],
    bubbleIn: [
      "max-w-[17.8rem] rounded-[1.25rem] rounded-ss-md bg-surface px-2.5 py-2.5",
      "text-surface-foreground shadow-[0_10px_28px_color-mix(in_oklch,var(--foreground)_10%,transparent)]",
      "ring-1 ring-border/60",
    ],
    message: "text-[0.8125rem] leading-snug",
    meta: "mt-1.5 flex items-center justify-end gap-1 text-[0.6875rem] text-muted",
    metaOut: "text-accent-foreground/75",
    check: "opacity-80",
    widget: [
      "mt-2 overflow-hidden rounded-2xl bg-background/80 ring-1 ring-border/70",
    ],
    widgetMedia:
      "relative h-[5.5rem] w-full bg-[linear-gradient(135deg,color-mix(in_oklch,var(--accent)_55%,#fbbf24),color-mix(in_oklch,var(--stats-green)_50%,var(--accent)))]",
    widgetBody: "flex flex-col gap-1.5 p-3",
    widgetTitle: "text-[0.8125rem] leading-snug font-semibold text-foreground",
    widgetSubtitle: "text-[0.6875rem] leading-snug text-muted",
    widgetCta:
      "mt-1 self-start rounded-full bg-accent px-3 py-1 text-[0.6875rem] font-semibold text-accent-foreground",
  },
});
