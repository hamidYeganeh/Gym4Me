import { tv } from "tailwind-variants";

export const ownerClubDetailIntroSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-1",
    title: "tracking-tight text-foreground",
    subtitle: "text-muted",
  },
});
