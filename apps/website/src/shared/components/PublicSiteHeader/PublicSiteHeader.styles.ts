import { tv } from "tailwind-variants";

export const publicSiteHeaderVariants = tv({
  slots: {
    root: "border-b border-border bg-background/95 px-6 py-4 text-foreground backdrop-blur",
    inner: "mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-4",
    brand: "text-lg font-bold tracking-tight",
    nav: "flex flex-wrap gap-5 text-sm",
    link: "hover:text-accent",
  },
});

export const publicSiteFooterVariants = tv({
  slots: {
    root: "border-t border-border px-6 py-8 text-sm text-muted",
    inner: "mx-auto flex w-full max-w-[1440px] flex-wrap justify-between gap-3",
  },
});
