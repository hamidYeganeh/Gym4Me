import { tv } from "tailwind-variants";

export const athleteRoleUpgradeSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4",
    header: "flex min-w-0 items-start justify-between gap-3 text-start",
    heading: "flex min-w-0 flex-1 flex-col gap-1.5",
    title: "text-balance text-xl leading-tight tracking-tight text-foreground",
    description: "max-w-[21rem] text-pretty text-sm leading-relaxed text-muted",
    close: "shrink-0 text-muted data-[hovered=true]:bg-default data-[pressed=true]:scale-[0.96]",
    list: "flex flex-col gap-3 overflow-visible pt-1",
    card: "relative",
    cardBody: "pe-16",
    cardClose: [
      "absolute end-3 top-3 z-20 size-8 rounded-full",
      "border border-border/70 bg-background/90 text-foreground shadow-sm",
      "data-[hovered=true]:bg-background",
      "data-[pressed=true]:scale-[0.96]",
    ].join(" "),
  },
});
