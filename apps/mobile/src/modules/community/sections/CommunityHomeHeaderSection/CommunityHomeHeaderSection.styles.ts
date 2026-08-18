import { tv } from "tailwind-variants";

export const communityHomeHeaderSectionVariants = tv({
  slots: {
    root: [
      "sticky top-0 z-40 bg-background/95 backdrop-blur-md",
      "pt-[env(safe-area-inset-top)]",
    ].join(" "),
    bar: "flex h-[72px] min-h-[72px] items-center gap-3 px-screen",
    identity: "flex min-w-0 flex-1 items-center gap-3",
    avatar: "size-12 shrink-0",
    copy: "flex min-w-0 flex-1 flex-col gap-0.5",
    greeting: "truncate tracking-tight text-foreground",
    status: "flex items-center gap-1.5 text-muted",
    statusDot: "text-muted",
    proIcon: "shrink-0 text-warning",
    actions: "flex shrink-0 items-center gap-2",
    notifyButton: [
      "rounded-full border border-border bg-surface text-foreground shadow-none",
    ].join(" "),
    searchButton: [
      "rounded-full bg-foreground text-background shadow-none",
      "hover:bg-foreground/90 data-[hovered=true]:bg-foreground/90",
      "[&_svg]:text-background",
    ].join(" "),
    searchRow: "px-screen pb-3",
    searchField: "w-full",
    searchGroup: [
      "h-11 rounded-full border border-border bg-surface shadow-none",
    ].join(" "),
  },
});
