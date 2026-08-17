import { tv } from "tailwind-variants";

export const discoverySectionRailVariants = tv({
  slots: {
    root: "flex flex-col gap-4",
    header: "flex items-start justify-between gap-3",
    titleRow: "flex min-w-0 flex-1 items-start gap-3",
    accent: "mt-1.5 h-8 w-1 shrink-0 rounded-full bg-accent",
    titleBlock: "min-w-0 flex-1",
    title:
      "min-w-0 flex-1 text-[1.35rem] leading-tight tracking-tight text-foreground",
    hint: "mt-1 text-muted",
    seeAll:
      "shrink-0 cursor-pointer text-sm font-semibold text-accent no-underline shadow-none",
    scroller:
      "-mx-screen flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-screen pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  },
  variants: {
    accent: {
      true: {},
      false: {
        titleRow: "min-w-0 flex-1",
        title: "min-w-0 flex-1 text-foreground",
        hint: "text-muted",
        root: "flex flex-col gap-3",
        header: "flex items-center justify-between gap-3",
      },
    },
    titleSize: {
      h3: {},
      h4: {
        title: "min-w-0 flex-1 text-foreground",
      },
    },
  },
  defaultVariants: {
    accent: true,
    titleSize: "h3",
  },
});
