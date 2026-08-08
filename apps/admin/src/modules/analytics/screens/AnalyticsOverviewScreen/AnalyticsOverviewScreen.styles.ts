import { tv } from "tailwind-variants";

export const analyticsOverviewScreenVariants = tv({
  slots: {
    content: "mx-auto flex w-full max-w-[1500px] flex-col gap-5",
    intro: "flex flex-col gap-1",
    title:
      "text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[2rem]",
    subtitle: "max-w-2xl text-sm leading-7 text-muted sm:text-base",
    conversionGrid: "grid gap-5 xl:grid-cols-2",
    engagementGrid:
      "grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]",
  },
});
