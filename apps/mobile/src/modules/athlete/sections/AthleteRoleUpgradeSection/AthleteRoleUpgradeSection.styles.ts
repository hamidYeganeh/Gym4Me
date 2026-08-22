import { tv } from "tailwind-variants";

export const athleteRoleUpgradeSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4",
    header: "flex min-w-0 items-start justify-between gap-3 text-start",
    heading: "flex min-w-0 flex-1 flex-col gap-1.5",
    title: "text-balance text-xl leading-tight tracking-tight text-foreground",
    description: "max-w-[21rem] text-pretty text-sm leading-relaxed text-muted",
    close:
      "size-10 shrink-0 rounded-full text-muted data-[hovered=true]:bg-default data-[pressed=true]:scale-[0.96]",
    list: "flex flex-col gap-3",
    card: "relative",
    cardClose: [
      "absolute end-3 top-3 z-10 size-9 rounded-full",
      "bg-background/85 text-foreground",
      "data-[hovered=true]:bg-background",
      "data-[pressed=true]:scale-[0.96]",
    ].join(" "),
  },
});
