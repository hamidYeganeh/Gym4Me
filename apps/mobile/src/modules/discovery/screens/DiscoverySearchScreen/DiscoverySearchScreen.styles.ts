import { tv } from "tailwind-variants";

export const discoverySearchScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-8 pb-14 pt-2",
    searchField: "w-full",
    searchGroup: [
      "h-12 rounded-full border border-border bg-transparent",
      "shadow-none",
    ].join(" "),
    filterButton: [
      "me-0.5 size-10 min-h-10 min-w-10 shrink-0 text-muted",
      "shadow-none",
    ].join(" "),
  },
});
