import { tv } from "tailwind-variants";

export const ownerMembersIntroSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-2",
    title: "tracking-tight text-foreground",
    subtitle: "text-muted",
    count: "text-muted",
  },
});
