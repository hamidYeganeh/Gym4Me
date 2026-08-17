import { tv } from "tailwind-variants";

export const discoveryCoachesReserveInfoStepSectionVariants = tv({
  slots: {
    section: "flex flex-col gap-3",
    sectionTitle: "text-foreground",
    sectionHint: "text-muted",
    fields: "flex flex-col gap-4",
    noteCount: "self-end text-muted",
  },
});
