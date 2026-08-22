/** Shared chrome for `/discovery` and `/discovery/clubs` stacked-sheet pages. */
export const discoveryPageLayoutStyles = {
  root: "bg-background",
  content: [
    "-mx-screen flex w-[calc(100%+2*var(--screen-margin))] min-w-0",
    "max-w-none flex-col overflow-x-clip pb-14 pt-2",
  ].join(" "),
  banners: "px-screen",
  sheets: [
    "mt-6 flex w-full min-w-0 flex-col",
    "[&>*+*]:-mt-[var(--discovery-sheet-overlap)]",
    "[&>*:nth-child(1)]:z-[1] [&>*:nth-child(2)]:z-[2] [&>*:nth-child(3)]:z-[3]",
    "[&>*:nth-child(4)]:z-[4] [&>*:nth-child(5)]:z-[5] [&>*:nth-child(6)]:z-[6]",
    "[&>*:nth-child(7)]:z-[7] [&>*:nth-child(8)]:z-[8] [&>*:nth-child(9)]:z-[9]",
  ].join(" "),
  empty: "px-screen pt-4",
} as const;
