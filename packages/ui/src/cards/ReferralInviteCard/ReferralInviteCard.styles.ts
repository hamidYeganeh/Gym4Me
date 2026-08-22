import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const referralInviteCardVariants = tv({
  slots: {
    root: [
      "relative flex w-full flex-col gap-5 overflow-hidden",
      "rounded-[1.75rem] bg-surface p-5 text-start",
    ].join(" "),
    watermark: "pointer-events-none absolute -end-3 -top-4 z-0 flex opacity-[0.1]",
    watermarkStack: "relative size-[5.5rem]",
    watermarkIcon: "absolute text-accent",
    watermarkIconFront: "start-0 top-0",
    watermarkIconBack: "start-4 top-3",
    header: "relative z-10 flex items-start gap-3",
    iconBadge: [
      "flex size-11 shrink-0 items-center justify-center",
      "rounded-2xl bg-accent text-accent-foreground",
    ].join(" "),
    copy: "flex min-w-0 flex-1 flex-col gap-1.5",
    title: "text-[1.05rem] leading-snug tracking-tight text-foreground",
    description: "text-[0.875rem] leading-relaxed text-muted",
    stats: "relative z-10 flex flex-col gap-3",
    stat: [
      "flex items-center justify-between gap-3",
      "rounded-2xl border border-border bg-surface px-4 py-3.5",
    ].join(" "),
    statLabel: "text-[0.75rem] text-muted",
    statValue: "text-[1.35rem] leading-none tracking-wide text-foreground",
    successValue: "text-accent",
    codeStat: [
      "flex h-auto min-h-0 w-full items-center justify-between gap-3",
      "rounded-2xl border border-border bg-surface px-4 py-3.5 shadow-none",
      "transition-colors duration-300",
      "data-[copied=true]:border-success/40 data-[copied=true]:bg-success/15",
      "data-[pressed=true]:scale-[0.99]",
    ].join(" "),
    codeValue: "font-mono uppercase",
    action: [
      "relative z-10 h-12 w-full gap-2 rounded-2xl font-bold shadow-none",
      "data-[pressed=true]:scale-[0.98]",
    ].join(" "),
  },
});

export type ReferralInviteCardVariantProps = VariantProps<
  typeof referralInviteCardVariants
>;
