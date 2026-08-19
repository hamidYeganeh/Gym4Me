import { tv } from "tailwind-variants";

export const publicSiteHeaderVariants = tv({
  slots: {
    root: [
      "sticky top-0 z-50 border-b border-border",
      "bg-background/95 text-foreground backdrop-blur-md",
      "pt-[env(safe-area-inset-top)]",
    ].join(" "),
    inner: [
      "mx-auto flex w-full min-w-0 max-w-[1440px] items-center justify-between gap-3",
      "px-4 py-3 sm:px-6 sm:py-4",
    ].join(" "),
    brand:
      "flex min-w-0 items-center gap-2 text-base font-bold tracking-tight sm:text-lg",
    brandMark: "shrink-0",
    nav: "hidden items-center gap-5 text-sm md:flex",
    link: "min-h-11 inline-flex items-center text-foreground transition-colors duration-fast ease-app hover:text-accent",
    actions: "flex shrink-0 items-center gap-1 sm:gap-2",
    menuTrigger: "text-foreground md:hidden",
    drawerContent: "w-[min(20rem,calc(100vw-1.5rem))]",
    drawerDialog: "bg-background text-foreground",
    drawerBody: "flex flex-col gap-1 pb-[max(1rem,env(safe-area-inset-bottom))]",
    drawerLink: [
      "flex min-h-12 items-center rounded-2xl px-4 text-base font-medium",
      "text-foreground transition-colors duration-fast ease-app",
      "hover:bg-surface-secondary hover:text-accent",
    ].join(" "),
  },
});

export const publicSiteFooterVariants = tv({
  slots: {
    root: [
      "border-t border-border px-4 py-8 text-sm text-muted",
      "pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6",
    ].join(" "),
    inner: [
      "mx-auto flex w-full max-w-[1440px] flex-col gap-3",
      "sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
    ].join(" "),
  },
});
