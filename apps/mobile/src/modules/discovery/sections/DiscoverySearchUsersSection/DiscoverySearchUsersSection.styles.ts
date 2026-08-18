import { tv } from "tailwind-variants";

export const discoverySearchUsersSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4",
    title: "text-foreground",
    list: "flex flex-col gap-3",
    card: [
      "w-full p-0 shadow-none",
      "rounded-[1.25rem] border border-border bg-background",
    ].join(" "),
    row: "flex w-full items-center gap-3 px-3.5 py-3",
    identity: [
      "flex h-auto min-h-0 min-w-0 flex-1 items-center gap-3 rounded-[0.75rem]",
      "px-0 py-0 text-start shadow-none",
      "hover:bg-transparent data-[hovered=true]:bg-transparent",
    ].join(" "),
    avatar: "size-12 shrink-0",
    avatarImage: "object-cover object-top",
    copy: "flex min-w-0 flex-1 flex-col gap-0.5",
    name: "truncate text-foreground",
    joined: "truncate text-muted",
    follow: "h-9 min-h-9 min-w-[5.75rem] shrink-0 rounded-full px-4",
    empty: "text-muted",
  },
});
