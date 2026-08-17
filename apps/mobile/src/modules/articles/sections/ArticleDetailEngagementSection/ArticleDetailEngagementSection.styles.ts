import { tv } from "tailwind-variants";

export const articleDetailEngagementSectionVariants = tv({
  slots: {
    root: "flex items-center gap-2 border-t border-border pt-4",
    actionButton:
      "min-w-0 flex-1 justify-center gap-2 text-muted data-[pressed=true]:bg-surface",
    actionActive: "text-warning",
  },
});
