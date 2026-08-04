import { tv } from "tailwind-variants";

export const minimalCarouselVariants = tv({
  slots: {
    root: "flex w-full items-center justify-center bg-transparent",
    stage: "flex w-full flex-col select-none",
    stack: "flex w-full flex-col gap-3",

    expanded:
      "relative flex w-full min-h-42.5 flex-col justify-between rounded-[28px] p-4 text-[var(--stats-foreground)] shadow-2xl sm:h-48 sm:rounded-[32px] sm:p-5",
    expandedHeader: "flex items-start justify-between gap-2",
    expandedIcon:
      "flex size-10 shrink-0 items-center justify-center rounded-full sm:size-11",
    copyButton: [
      "h-auto min-h-0 gap-1.5 whitespace-nowrap rounded-full border-0",
      "bg-white/10 px-3 py-1.5 text-xs font-bold text-[var(--stats-foreground)]",
      "shadow-none backdrop-blur-md transition-colors",
      "hover:bg-white/20 data-[hovered=true]:bg-white/20",
      "sm:px-4 sm:py-2 sm:text-base",
    ].join(" "),
    expandedFooter: "mt-4 flex items-end justify-between",
    expandedMeta: "me-2 min-w-0 overflow-hidden",
    expandedTitle: [
      "truncate text-xl font-semibold leading-tight text-[var(--stats-foreground)]",
      "opacity-90 sm:text-2xl",
    ].join(" "),
    expandedValue: [
      "truncate text-lg font-semibold tracking-tight text-[var(--stats-foreground)]",
      "opacity-60 sm:text-xl",
    ].join(" "),
    editButton: [
      "h-auto min-h-0 shrink-0 rounded-full border-0",
      "bg-white/30 px-3 py-1 text-sm font-bold text-[var(--stats-foreground)]",
      "shadow-none backdrop-blur-md transition-colors",
      "hover:bg-white/40 data-[hovered=true]:bg-white/40",
      "sm:px-4 sm:py-1.5 sm:text-base",
    ].join(" "),
    grid: "grid gap-2 transition-all duration-500 sm:gap-3",
    tile: "relative flex cursor-pointer flex-col justify-between rounded-[22px] p-3 text-[var(--stats-foreground)] shadow-lg sm:rounded-[28px] sm:p-4",
    tileHeader: "flex items-start justify-between",
    moreBadge: "rounded-full bg-white/10 p-1 transition-colors sm:p-1.5",
    tileMeta: "mt-1 overflow-hidden",
    tileTitle:
      "truncate font-medium leading-tight text-[var(--stats-foreground)] opacity-90",
    tileValue:
      "truncate font-semibold text-[var(--stats-foreground)] opacity-60",
  },
  variants: {
    compact: {
      true: {
        grid: "grid-cols-3",
        tile: "h-24 sm:h-28",
        tileTitle: "text-[10px] sm:text-xs",
        tileValue: "text-[10px] sm:text-xs",
      },
      false: {
        grid: "grid-cols-2",
        tile: "h-28 sm:h-32",
        tileTitle: "text-sm sm:text-base",
        tileValue: "text-sm sm:text-base",
      },
    },
  },
  defaultVariants: {
    compact: false,
  },
});
