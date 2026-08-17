import { tv } from "tailwind-variants";

export const ownerClubsCreateKycGateSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4 rounded-[24px] bg-surface p-5",
    title: "text-foreground",
    hint: "text-muted",
  },
});
