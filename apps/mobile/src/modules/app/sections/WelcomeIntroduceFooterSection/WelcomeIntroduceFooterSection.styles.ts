import { tv } from "tailwind-variants";

export const welcomeIntroduceFooterSectionVariants = tv({
  slots: {
    root: "relative shrink-0",
    band: "relative px-5 pb-5 pt-16",
    fade: "pointer-events-none absolute inset-x-0 -bottom-8 top-0",
    blur: "pointer-events-none absolute inset-0",
    wash: [
      "absolute inset-0",
      "bg-[linear-gradient(to_top,var(--background)_0%,color-mix(in_oklch,var(--background)_78%,transparent)_48%,transparent_100%)]",
    ],
    copy: "relative z-10 flex flex-col items-center gap-3 text-center",
    title:
      "max-w-[21.5rem] text-balance text-[1.75rem] leading-[1.2] font-bold tracking-tight text-foreground",
    subtitle:
      "max-w-[21.5rem] text-pretty text-[0.9375rem] leading-[1.4] text-muted",
    sheet: [
      "relative z-10 rounded-t-[2rem] bg-surface px-5 pt-5",
      "pb-[max(1.25rem,env(safe-area-inset-bottom))]",
      "shadow-[0_-8px_32px_color-mix(in_oklch,var(--foreground)_6%,transparent)]",
    ],
    row: "flex items-center justify-between gap-4",
    navButton: [
      "size-16 shrink-0 rounded-full border-0",
      "bg-foreground text-background",
      "shadow-none transition-transform duration-fast ease-app",
      "data-[hovered=true]:opacity-90 data-[pressed=true]:scale-95",
      "[&_svg]:size-6",
    ],
    dots: "relative flex h-3 max-w-[12rem] flex-wrap items-center justify-center gap-1.5",
    dot: "relative h-1.5 w-3 shrink-0 rounded-full bg-default",
    dotActive: "relative h-1.5 w-5 shrink-0 rounded-full bg-accent",
  },
});
