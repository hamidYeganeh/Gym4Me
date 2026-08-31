import { tv } from "tailwind-variants";

export const baseProfileHeroSectionVariants = tv({
  slots: {
    spacer: "pointer-events-none shrink-0",
    root: [
      "fixed top-0 left-1/2 z-30 w-full max-w-xl -translate-x-1/2",
      "overflow-hidden rounded-b-3xl",
      "pt-[env(safe-area-inset-top)]",
    ].join(" "),
    cover: [
      "pointer-events-none absolute inset-x-0 top-0 z-0 overflow-hidden",
      "bg-foreground rounded-b-3xl object-cover",
    ].join(" "),
    coverMedia: "absolute inset-0",
    coverImage:
      "object-cover object-center grayscale contrast-125 brightness-75",
    /** Collapsed shell — solid surface behind the compact toolbar. */
    shell: [
      "pointer-events-none absolute inset-0 z-[1]",
      "bg-surface-tertiary",
    ].join(" "),
    stage: "relative z-10 w-full",
    control: "absolute z-20",
    /** No overflow clip — edit badge sits outside the avatar circle. */
    avatar: "absolute z-20 origin-center",
    avatarInner: [
      "size-full overflow-hidden rounded-full",
      "border-[3px] border-background bg-surface shadow-sm",
    ].join(" "),
    avatarImage: "size-full object-cover",
    avatarFallback: [
      "flex size-full items-center justify-center",
      "bg-accent/15 text-accent",
    ].join(" "),
    avatarUpload: [

      "absolute -bottom-0.5 -end-0.5 z-30 !size-8 min-w-8",

      "!bg-foreground !text-background shadow-sm",

    ].join(" "),
  },
});
