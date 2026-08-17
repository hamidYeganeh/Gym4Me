import { tv } from "tailwind-variants";

export const discoveryBrowseCoachesAllSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-3",
    header: "flex items-center justify-between gap-3",
    title: "min-w-0 flex-1 text-foreground",
    stack: "flex flex-col gap-4",
    cardVertical: "w-full max-w-[300px] self-center",
    cardDefault: "w-full",
  },
});
