import { tv } from "tailwind-variants";

export const athleteReferralScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-10 pt-1",
    stats: "grid grid-cols-3 gap-2",
    stat: "flex flex-col items-center gap-1 rounded-2xl bg-default px-2 py-3 text-center",
    statValue: "text-foreground",
    statLabel: "text-muted",
    inviteForm: "flex flex-col gap-3",
    list: "flex flex-col gap-3",
    inviteCard:
      "flex items-center justify-between gap-3 rounded-[24px] border-0 bg-surface p-4",
    inviteMeta: "flex min-w-0 flex-col gap-0.5",
    meta: "text-muted",
    empty:
      "flex flex-col items-center gap-2 rounded-[24px] border-0 bg-surface px-6 py-10 text-center",
  },
});
