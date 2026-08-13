import { tv } from "tailwind-variants";

/** Sandow metric cards — black squircles, tone charts, pressure glow ring. */
export const welcomeMetricCardVariants = tv({
  slots: {
    root: [
      "relative flex w-full flex-col gap-3.5 overflow-hidden rounded-[2rem] p-5",
      "border border-white/10 text-white",
      "shadow-[0_16px_36px_-18px_rgba(0,0,0,0.55)]",
    ],
    header: "flex w-full flex-row items-center justify-between gap-2 p-0",
    titleRow: "flex min-w-0 items-center gap-2",
    titleIcon: "size-5 shrink-0",
    title: "truncate text-[0.9375rem] font-semibold text-white",
    periodRow: "inline-flex shrink-0 items-center gap-1.5 text-xs text-zinc-400",
    periodIcon: "size-3.5 text-zinc-400",
    body: "flex w-full flex-row items-end justify-between gap-3",
    metrics: "flex min-w-0 flex-1 flex-col gap-1.5",
    valueRow: "flex flex-wrap items-baseline gap-1.5",
    value: "text-[1.875rem] leading-none font-bold tracking-tight text-white",
    unit: "text-sm font-medium text-white/90",
    status: "text-[0.75rem] leading-snug text-zinc-400",
    chartWrap: "w-[44%] shrink-0",
    chart: "h-[3.75rem] w-full overflow-visible",
    weekdayRow: "mt-1 flex justify-between px-0.5 text-[0.55rem] text-zinc-500",
  },
  variants: {
    tone: {
      weight: {
        root: "bg-black",
        titleIcon: "text-stats-orange",
      },
      pressure: {
        titleIcon: "text-stats-purple",
        root: [
          "border-transparent",
          "[background:linear-gradient(#000,#000)_padding-box,linear-gradient(105deg,#ff2d55_0%,#e11d48_40%,#9333ea_100%)_border-box]",
          "shadow-[0_0_0_1px_rgba(255,45,85,0.2),0_0_36px_-4px_rgba(255,45,85,0.55)]",
        ],
        periodIcon: "size-4 text-rose-500",
      },
      heart: {
        root: "bg-black",
        titleIcon: "text-stats-red",
      },
    },
  },
  defaultVariants: {
    tone: "weight",
  },
});
