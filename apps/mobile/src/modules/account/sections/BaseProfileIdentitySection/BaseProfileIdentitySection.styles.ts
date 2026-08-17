import { tv } from "tailwind-variants";

export const baseProfileIdentitySectionVariants = tv({
  slots: {
    identity: "flex flex-col items-center gap-1.5 px-1 pt-3 text-center",
    memberChip: [
      "border border-accent bg-transparent text-accent",
      "[&_.chip__label]:text-xs [&_.chip__label]:font-semibold",
      "[&_.chip__label]:tracking-wide [&_.chip__label]:lowercase",
    ].join(" "),
    memberSince: "text-muted",
    name: "mt-0.5 tracking-tight text-foreground",
    stats: "mx-1 grid grid-cols-3 items-stretch",
    stat: [
      "flex flex-col items-center gap-1 px-2 py-1 text-center",
      "not-first:border-s not-first:border-border",
    ].join(" "),
    statIcon: "text-muted",
    statValue: "tabular-nums text-foreground",
    statLabel: "text-muted",
    actions: "grid grid-cols-2 gap-3 px-1",
    followButton: "rounded-[1rem] font-semibold",
    chatButton: "rounded-[1rem] border-accent font-semibold text-accent",
    kycCard:
      "flex flex-col gap-3 rounded-[1.5rem] border border-accent/40 bg-accent/10 p-5",
    kycHint: "text-sm text-muted",
  },
});
