import { tv } from "tailwind-variants";

export const baseProfileHeroSectionVariants = tv({
  slots: {
    root: "relative -mx-screen",
    cover: [
      "relative flex h-40 w-full items-center justify-center overflow-hidden",
      "rounded-b-[2rem] bg-surface-secondary text-muted",
    ].join(" "),
    coverIcon: "opacity-45",
    avatarRow:
      "relative z-10 -mt-14 flex items-end justify-center gap-5 px-screen",
    sideAction: [
      "size-12 shrink-0 rounded-[1rem] border-0 bg-surface",
      "text-foreground",
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
  },
});
