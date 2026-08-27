import { tv } from "tailwind-variants";

export const profileHeaderVariants = tv({
  slots: {
    spacer: "pointer-events-none shrink-0",
    root: [
      "fixed top-0 left-1/2 z-40 w-full max-w-xl -translate-x-1/2",
      "overflow-hidden bg-surface-secondary rounded-b-3xl",
      "pt-[env(safe-area-inset-top)]",
    ].join(" "),
    backdrop: "pointer-events-none absolute inset-0 z-0",
    backdropBlur: "absolute inset-0",
    backdropFade: ["pointer-events-none absolute inset-0"].join(" "),
    cover: "pointer-events-none absolute inset-0 z-0",
    coverImage: "object-cover",
    coverFade: "pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[55%]",
    coverBlur: "pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[55%]",
    /** Collapsed shell — solid surface (no gradient). */
    shell: [
      "pointer-events-none absolute inset-0 z-[3]",
      "rounded-b-[2.5rem]",
    ].join(" "),
    stage: "relative z-10 w-full",
    avatar: [
      "absolute start-screen z-20 overflow-hidden",
      "origin-top-left rtl:origin-top-right",
    ].join(" "),
    avatarImage: "size-full object-cover",
    notify: "absolute end-screen z-20 flex items-center justify-end",
    notifyButton:
      "h-11 min-w-11 gap-0 overflow-hidden rounded-[0.875rem] px-2.5 font-semibold",
    notifyLabel: "inline-block overflow-hidden whitespace-nowrap",
    notifyBadge: "pointer-events-none",
    identity: [
      "absolute z-20 flex min-w-0 flex-col gap-2 text-start",
      "overflow-hidden",
    ].join(" "),
    nameWrap: ["origin-top-left rtl:origin-top-right", "w-max max-w-full"].join(
      " ",
    ),
    name: [
      "truncate text-[2.75rem] leading-[1.05] tracking-tight text-foreground",
      "sm:text-5xl",
    ].join(" "),
    bio: "max-w-[19rem] text-pretty leading-snug text-muted",
  },
});
