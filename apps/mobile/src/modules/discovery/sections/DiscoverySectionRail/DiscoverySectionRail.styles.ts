import { tv } from "tailwind-variants";

import { discoveryHomeCarouselClassNames } from "../../lib/discovery-home-carousel";

export const discoverySectionRailVariants = tv({
  slots: {
    root: "flex flex-col gap-4",
    pattern: "pointer-events-none absolute inset-0 z-0 size-full text-white opacity-[0.16]",
    header: "relative z-10 flex items-start justify-between gap-3",
    titleRow: "flex min-w-0 flex-1 items-center gap-2",
    accent: "mt-0.5 shrink-0 text-accent",
    titleBlock: "min-w-0 flex-1",
    title:
      "min-w-0 flex-1 text-[1.35rem] leading-tight tracking-tight text-foreground",
    hint: "mt-1 text-muted",
    seeAll:
      "shrink-0 cursor-pointer text-sm font-semibold text-accent no-underline shadow-none",
    scroller: discoveryHomeCarouselClassNames.carousel,
  },
  variants: {
    accent: {
      true: {},
      false: {
        titleRow: "min-w-0 flex-1",
        title: "min-w-0 flex-1 text-foreground",
        hint: "text-muted",
        root: "flex flex-col gap-3",
        header: "relative z-10 flex items-center justify-between gap-3",
      },
    },
    titleSize: {
      h3: {},
      h4: {
        title: "min-w-0 flex-1 text-foreground",
      },
    },
    sheet: {
      true: {
        root: [
          "relative isolate w-full max-w-none",
          "overflow-hidden rounded-t-4xl",
          "!gap-5 px-screen pt-8",
          "pb-[calc(var(--discovery-sheet-overlap)+var(--discovery-sheet-gap))] last:pb-10",
        ].join(" "),
      },
      false: {},
    },
    tone: {
      surface: {
        root: "bg-surface",
      },
      warning: {
        root: "bg-warning text-warning-foreground",
        title: "text-warning-foreground",
        hint: "text-warning-foreground/70",
        accent: "text-warning-foreground",
        seeAll: "text-warning-foreground",
      },
      accent: {
        root: "bg-accent text-accent-foreground",
        title: "text-accent-foreground",
        hint: "text-accent-foreground/70",
        accent: "text-accent-foreground",
        seeAll: "text-accent-foreground",
      },
      muted: {
        root: "bg-surface-secondary",
      },
    },
  },
  defaultVariants: {
    accent: true,
    titleSize: "h3",
    sheet: false,
  },
});
