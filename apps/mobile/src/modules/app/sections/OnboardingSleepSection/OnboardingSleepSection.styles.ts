import { tv } from "tailwind-variants";

export const onboardingSleepSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-md flex-col items-center gap-8",
    valueStack: "flex flex-col items-center gap-2",
    value:
      "text-[4.5rem] font-bold tabular-nums leading-none tracking-tight text-foreground sm:text-8xl",
    label: "text-base font-medium text-muted",
    tabs: "w-full",
    tabsListContainer: "w-full rounded-none bg-transparent p-0 shadow-none",
    tabsList:
      "flex w-full items-stretch gap-0 rounded-2xl bg-default p-1.5 shadow-none",
    tab: [
      "relative z-0 flex h-12 min-w-0 flex-1 items-center justify-center",
      "rounded-xl px-0 text-base font-semibold text-muted shadow-none",
      "transition-[color] duration-fast ease-app",
      "data-[selected=true]:z-[1] data-[selected=true]:bg-transparent data-[selected=true]:text-foreground data-[selected=true]:shadow-none",
      "data-[hovered=true]:not-data-[selected=true]:bg-transparent data-[hovered=true]:not-data-[selected=true]:text-foreground",
    ].join(" "),
    tabIndicator: "inset-0 rounded-xl bg-background shadow-sm",
    description: "text-center text-sm leading-6 text-muted",
  },
});
