import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const settingsScreenVariants = tv({
  slots: {
    root: "bg-background before:hidden",
    content: "flex flex-col gap-7 pb-12 pt-2",
    intro: "flex flex-col gap-1",
    introTitle: "text-balance tracking-tight text-foreground",
    introSubtitle: "max-w-[21rem] text-pretty leading-relaxed text-muted",
    group: "flex flex-col gap-2",
    groupTitle: "px-1 text-muted",
    groupCard:
      "overflow-hidden rounded-[24px] border-0 bg-surface",
    row: "flex w-full items-center gap-3 px-4 py-3.5",
    rowPressable: "justify-start text-start font-normal",
    rowIcon:
      "flex size-10 shrink-0 items-center justify-center rounded-[0.875rem] bg-default text-foreground",
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
