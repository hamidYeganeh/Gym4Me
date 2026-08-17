import { tv } from "tailwind-variants";

export const discoveryClubsReserveHeroSectionVariants = tv({
  slots: {
    hero: "relative h-[36dvh] min-h-56 w-full overflow-hidden",
    heroImage: "object-cover object-center",
    heroScrim: [
      "pointer-events-none absolute inset-0",
      "bg-linear-to-t from-background via-background/45 to-background/15",
    ].join(" "),
    sheet: [
      "relative z-10 -mt-14 flex flex-col gap-6",
      "rounded-t-[2.5rem] bg-background px-5 pb-6 pt-7",
    ].join(" "),
    titleBlock: "flex flex-col gap-1.5",
    eyebrow: "text-sm font-medium text-muted",
    title:
      "text-balance text-[1.65rem] leading-tight tracking-tight text-foreground",
    location: "text-sm text-muted",
  },
});
