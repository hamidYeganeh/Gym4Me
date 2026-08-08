import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const settingsScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-10 pt-1",
    intro: "flex flex-col gap-1",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    group: "flex flex-col gap-2",
    groupTitle: "px-1 text-muted",
    groupCard:
      "overflow-hidden rounded-[24px] border border-border bg-surface",
    row: "flex w-full items-center gap-3 px-4 py-3.5",
    rowPressable:
      "h-auto justify-start rounded-none text-start font-normal",
    rowIcon:
      "flex size-10 shrink-0 items-center justify-center rounded-full bg-default text-foreground",
    rowBody: "flex min-w-0 flex-1 flex-col gap-0.5",
    rowLabel: "text-foreground",
    rowHint: "text-muted",
    rowValue: "shrink-0 text-sm text-muted",
    rowChevron: "shrink-0 text-muted",
    divider: "mx-4 h-px bg-border last:hidden",
    logout: "mt-2",
  },
});

export type SettingsScreenVariants = VariantProps<
  typeof settingsScreenVariants
>;
