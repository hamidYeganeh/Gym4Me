import { tv } from "tailwind-variants";

export const settingsNavGroupSectionVariants = tv({
  slots: {
    group: "flex flex-col gap-2",
    groupTitle: "px-1 font-semibold uppercase tracking-wide text-muted",
    groupCard:
      "overflow-hidden rounded-[24px] border-0 bg-surface shadow-none",
    rowPressable:
      "justify-start gap-3 text-start data-[hovered=true]:bg-default/60 data-[pressed=true]:bg-default/80",
    row: "flex w-full items-center gap-3",
    rowIcon:
      "flex size-10 shrink-0 items-center justify-center rounded-2xl bg-default text-foreground",
    rowBody: "flex min-w-0 flex-1 flex-col gap-0.5",
    rowLabel: "text-foreground",
    rowHint: "text-muted",
    rowChevron: "shrink-0 text-muted",
    divider: "mx-4 h-px bg-border",
  },
});
