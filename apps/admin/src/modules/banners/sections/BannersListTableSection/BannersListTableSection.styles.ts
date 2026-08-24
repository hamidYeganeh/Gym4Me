import { tv } from "tailwind-variants";

export const bannersListTableSectionVariants = tv({
  slots: {
    actions: "flex flex-wrap gap-2",
    previewGroup: "flex min-w-24 items-center -space-x-3 space-x-reverse",
    previewImage:
      "h-12 w-16 rounded-lg border-2 border-default bg-muted/20 object-cover",
    previewMore:
      "flex h-10 min-w-10 items-center justify-center rounded-full border-2 border-default bg-muted px-1 text-xs font-medium tabular-nums text-muted-foreground",
  },
});
