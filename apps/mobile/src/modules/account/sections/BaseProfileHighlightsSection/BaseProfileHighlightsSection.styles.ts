import { tv } from "tailwind-variants";

export const baseProfileHighlightsSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-5",
    invite: [
      "relative flex min-h-[7.5rem] overflow-hidden rounded-2xl",
      "bg-surface",
    ].join(" "),
    inviteCopy: "z-10 flex min-w-0 flex-1 flex-col justify-center gap-2 p-4",
    inviteTitle: "max-w-[11.5rem] text-start leading-snug text-foreground",
    inviteCta:
      "h-auto min-h-0 justify-start px-0 py-0 font-semibold text-accent",
    inviteMedia:
      "relative min-h-[7.5rem] w-[42%] shrink-0 self-stretch bg-black",
    inviteImage: "object-cover object-top",
    block: "flex flex-col gap-2",
    blockHeader: "flex items-center justify-between gap-3 px-1",
    blockTitle: "text-foreground",
    blockLink: "h-auto min-h-0 px-0 py-0 font-semibold text-accent",
    card: "overflow-hidden rounded-2xl bg-surface p-4",
    streakBody: "flex items-center gap-3",
    streakCopy: "min-w-0 flex-1",
    streakHint: "text-pretty text-muted",
    streakIcon: "flex size-16 shrink-0 items-center justify-center text-accent",
    streakFooter: "mt-4 flex items-center justify-between gap-3",
    streakLabel: "text-muted",
    streakValue: "text-foreground",
    achievementsRow: "flex items-center justify-center gap-3 py-1",
    achievementsEmpty: "py-4 text-center text-muted",
    achievementsFooter: "mt-4 flex items-center justify-between gap-3",
    achievementsLabel: "text-muted",
    achievementsValue: "text-foreground",
  },
});
