import { tv } from "tailwind-variants";

export const discoveryHomeSportsSectionVariants = tv({
  slots: {
    scroller: "grid grid-cols-2 gap-2",
    card: "!h-[13.75rem] !w-full !rounded-[1.35rem] snap-start",
    cardFeatured:
      "!h-[13.75rem] !w-full !rounded-[1.35rem] col-span-2",
  },
});

export const HOME_SPORT_THEMES = [
  {
    color: "var(--accent)",
    foregroundColor: "var(--accent-foreground)",
    actionColor: "var(--accent-foreground)",
    actionForegroundColor: "var(--accent)",
  },
  {
    color: "var(--stats-blue)",
    foregroundColor: "var(--stats-foreground)",
    actionColor: "var(--eclipse)",
    actionForegroundColor: "var(--stats-foreground)",
  },
  {
    color: "var(--stats-orange)",
    foregroundColor: "var(--stats-foreground)",
    actionColor: "var(--eclipse)",
    actionForegroundColor: "var(--stats-foreground)",
  },
  {
    color: "var(--stats-purple)",
    foregroundColor: "var(--stats-foreground)",
    actionColor: "var(--eclipse)",
    actionForegroundColor: "var(--stats-foreground)",
  },
] as const;
