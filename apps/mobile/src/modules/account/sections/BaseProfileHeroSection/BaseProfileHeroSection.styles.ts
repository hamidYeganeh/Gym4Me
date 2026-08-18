import { tv } from "tailwind-variants";

export const baseProfileHeroSectionVariants = tv({
  slots: {
    root: "relative -mx-screen -mt-[env(safe-area-inset-top)]",
    cover: [
      "relative h-[calc(13.75rem+env(safe-area-inset-top))] w-full overflow-hidden",
      "rounded-b-[2rem] bg-foreground",
    ].join(" "),
    coverImage: "object-cover object-center grayscale contrast-125 brightness-75",
    coverOverlay:
      "absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-black/25",
    avatarRow:
      "relative z-10 -mt-14 flex items-end justify-center gap-6 px-screen",
    sideAction: [
      "size-12 shrink-0 rounded-full border border-border bg-surface",
      "text-muted shadow-sm",
    ].join(" "),
    avatarWrap: "relative shrink-0",
    avatar: [
      "size-24 overflow-hidden rounded-full",
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
  },
});
