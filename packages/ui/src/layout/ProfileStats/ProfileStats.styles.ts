import { tv } from "tailwind-variants";

export const profileStatsVariants = tv({
  slots: {
    root: "grid grid-cols-2 gap-3",
    card: [
      "relative flex min-h-[6.5rem] flex-col justify-between overflow-hidden",
      "rounded-[1.75rem] border border-border bg-surface p-4",
      "text-surface-foreground shadow-sm",
    ].join(" "),
    label: "text-sm font-medium text-muted",
    value: "text-3xl font-bold tracking-tight text-foreground",
    avatars: "absolute end-3 bottom-3 flex items-center",
    avatar: [
      "-ms-2 size-7 overflow-hidden rounded-full",
      "ring-2 ring-surface first:ms-0",
      "bg-default",
    ].join(" "),
    avatarImage: "size-full object-cover",
    action: "absolute end-3 bottom-3 rounded-full",
  },
});
