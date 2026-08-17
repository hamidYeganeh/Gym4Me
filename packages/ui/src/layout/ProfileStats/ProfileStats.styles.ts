import { tv } from "tailwind-variants";

export const profileStatsVariants = tv({
  slots: {
    root: [
      "grid grid-cols-2 gap-px overflow-hidden rounded-[1.5rem]",
      "bg-border",
    ].join(" "),
    card: [
      "relative flex min-h-[7rem] flex-col justify-between overflow-hidden",
      "bg-surface p-4 text-surface-foreground",
    ].join(" "),
    label: "text-xs font-semibold leading-snug text-muted",
    value: "text-[2rem] font-bold tracking-tight text-foreground tabular-nums",
    avatars: "absolute end-3 bottom-3 flex items-center",
    avatar: [
      "-ms-2 size-7 overflow-hidden rounded-[0.625rem]",
      "ring-2 ring-surface first:ms-0",
      "bg-default",
    ].join(" "),
    avatarImage: "size-full object-cover",
    action: "absolute end-3 bottom-3 rounded-xl bg-default",
  },
});
