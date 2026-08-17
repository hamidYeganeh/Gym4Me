import { tv } from "tailwind-variants";

export const discoveryCoachesSlotsFooterSectionVariants = tv({
  slots: {
    root: "flex w-full flex-col items-center gap-3",
    selectionSummary: "text-center text-sm text-muted",
    bookButton: [
      "h-14 w-full rounded-[1.25rem] border-0",
      "bg-accent text-accent-foreground shadow-none",
      "data-[hovered=true]:opacity-95",
    ].join(" "),
    bookLabel: "text-base font-bold text-accent-foreground",
    bookIcon: "size-5 shrink-0 text-accent-foreground",
  },
});
