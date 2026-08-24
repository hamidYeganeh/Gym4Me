/** Shared chrome for `/discovery` and `/discovery/clubs` section feeds. */
export const discoveryPageLayoutStyles = {
  root: "bg-surface",
  content: [
    "-mx-screen flex w-[calc(100%+2*var(--screen-margin))] min-w-0",
    "max-w-none flex-col overflow-x-clip pt-2",
  ].join(" "),
  banners: "px-screen",
  sheets: "mt-4 flex w-full min-w-0 flex-col gap-3",
  empty: "px-screen pt-4",
} as const;
