import { tv } from "tailwind-variants";

export const welcomeIntroduceCoachSectionVariants = tv({
  slots: {
    root: "mx-auto flex w-full max-w-[21.5rem] shrink-0 flex-col items-center gap-4",
    avatars: "relative flex h-16 w-[18rem] items-end justify-center",
    avatar: [
      "absolute overflow-hidden rounded-full bg-surface ring-2 ring-background",
      "shadow-[0_8px_20px_color-mix(in_oklch,var(--foreground)_14%,transparent)]",
    ],
    avatarA: "start-[0%] bottom-0 size-8 bg-stats-blue/30",
    avatarB: "start-[16%] bottom-1 size-12 bg-stats-purple/30",
    avatarC: "start-1/2 bottom-2 size-16 -translate-x-1/2 bg-accent/35",
    avatarD: "end-[16%] bottom-1 size-12 bg-stats-green/30",
    avatarE: "end-[0%] bottom-0 size-8 bg-stats-red/25",
    connector: "flex h-11 flex-col items-center",
    line: "h-8 w-px bg-border",
    pin: "size-3 rounded-full bg-accent shadow-[0_0_0_4px_color-mix(in_oklch,var(--accent)_30%,transparent)]",
    card: [
      "w-full rounded-[1.5rem] bg-surface p-3",
      "shadow-[0_16px_40px_color-mix(in_oklch,var(--foreground)_12%,transparent)]",
      "ring-1 ring-border/60",
    ],
    cardTop: "flex gap-3",
    photo:
      "size-12 shrink-0 overflow-hidden rounded-2xl bg-[linear-gradient(145deg,var(--accent),color-mix(in_oklch,var(--accent)_40%,#111))]",
    info: "min-w-0 flex-1",
    name: "truncate text-[0.9375rem] font-semibold text-foreground",
    price: "mt-0.5 text-[0.8125rem] text-muted",
    metaRow: "mt-2 flex flex-wrap items-center gap-2 text-[0.75rem] text-muted",
    metaItem: "inline-flex items-center gap-1.5",
    metaIcon: "text-accent",
    ratingRow: "mt-2 flex items-center gap-1.5 text-[0.8125rem] text-foreground",
    stars: "inline-flex items-center gap-0.5 text-accent",
    availability:
      "mt-2 inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-stats-green",
    chevron: "mt-6 shrink-0 self-start text-muted",
    thumbs: "mt-3 flex gap-2 overflow-hidden",
    thumb: "h-[3.125rem] w-[5.5rem] shrink-0 rounded-xl bg-default/80",
    thumbA: "bg-[linear-gradient(135deg,#fb923c,#f97316)]",
    thumbB: "bg-[linear-gradient(135deg,#60a5fa,#2563eb)]",
    thumbC: "bg-[linear-gradient(135deg,#a78bfa,#7c3aed)]",
    thumbD: "bg-[linear-gradient(135deg,#34d399,#059669)]",
  },
});
