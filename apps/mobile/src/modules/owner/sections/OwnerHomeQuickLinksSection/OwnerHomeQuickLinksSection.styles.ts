import { tv } from "tailwind-variants";

export const ownerHomeQuickLinksSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4",
    header: "flex flex-col gap-1",
    title: "text-balance tracking-tight text-foreground",
    description: "max-w-[21rem] text-pretty leading-relaxed text-muted",
    grid: "grid grid-cols-2 gap-3",
  },
});
