import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const baseProfileScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-5 pb-14",
    hero: "relative -mx-screen",
    cover: [
      "relative flex h-40 w-full items-center justify-center overflow-hidden",
      "rounded-b-[2rem] bg-surface-secondary text-muted",
    ].join(" "),
    coverIcon: "opacity-45",
    avatarRow:
      "relative z-10 -mt-14 flex items-end justify-center gap-5 px-screen",
    sideAction: [
      "size-12 shrink-0 rounded-[1rem] border-0 bg-surface",
      "text-foreground shadow-sm shadow-foreground/5",
    ].join(" "),
    avatarWrap: "relative shrink-0",
    avatar: [
      "size-[7.25rem] overflow-hidden rounded-[2rem]",
      "border-[3px] border-background bg-surface shadow-sm",
    ].join(" "),
    avatarImage: "size-full object-cover",
    avatarFallback: [
      "flex size-full items-center justify-center",
      "bg-accent/15 text-accent",
    ].join(" "),
    avatarUpload: [
      "absolute -bottom-0.5 -end-0.5 !size-8 min-h-8 min-w-8 rounded-full",
      "!bg-foreground !text-background shadow-sm",
    ].join(" "),
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
    statValue: "text-foreground tabular-nums",
    statLabel: "text-muted",
    actions: "grid grid-cols-2 gap-3 px-1",
    followButton: "rounded-[1rem] font-semibold",
    chatButton: "rounded-[1rem] border-accent font-semibold text-accent",
    postsCard: [
      "mt-1 flex min-h-64 flex-col overflow-hidden rounded-[1.5rem]",
      "border-0 bg-surface shadow-sm shadow-foreground/5",
    ].join(" "),
    postsBody:
      "flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center",
    postsTitle: "max-w-[16rem] text-balance text-foreground",
    postsHint: "max-w-[18rem] text-pretty text-muted",
    postsFooter: "border-t border-border px-4 py-3",
    createPost: "mx-auto h-auto min-h-0 px-0 py-0 font-semibold text-accent",
    kycCard:
      "flex flex-col gap-3 rounded-[1.5rem] border border-accent/40 bg-accent/10 p-5",
    kycHint: "text-sm text-muted",
  },
});

export type BaseProfileScreenVariants = VariantProps<
  typeof baseProfileScreenVariants
>;
