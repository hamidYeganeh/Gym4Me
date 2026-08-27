import { tv } from "tailwind-variants";

export const baseProfileHighlightsSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-5",
    invite: ["relative flex overflow-hidden rounded-3xl", "bg-surface"].join(
      " ",
    ),
    inviteCopy:
      "relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-4 p-4 h-42",
    inviteTitle: "max-w-1/2 text-start leading-snug text-white",
    inviteCta: "",
    inviteMedia: [
      "absolute inset-0 bg-black",
      "after:absolute after:inset-0 after:bg-gradient-to-l after:from-black/80 after:via-black/40 after:to-transparent",
    ].join(" "),
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
