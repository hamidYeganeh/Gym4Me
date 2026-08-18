import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const profileSettingsFormSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4",
    field: "flex w-full flex-col gap-2",
    label: "text-sm font-bold text-foreground",
    inputGroup: [
      "h-14 min-h-14 w-full rounded-2xl border border-border",
      "bg-transparent px-4 shadow-none",
    ].join(" "),
    input: "min-w-0 flex-1 bg-transparent text-sm shadow-none",
    icon: "shrink-0 text-muted",
    selectTrigger: [
      "flex h-14 min-h-14 w-full items-center gap-3 rounded-2xl",
      "border border-border bg-transparent px-4 shadow-none",
    ].join(" "),
    selectValue: "min-w-0 flex-1 truncate text-start text-sm text-foreground",
    phonePrefix: "flex items-center gap-1.5 text-sm font-semibold text-foreground",
    help: [
      "flex size-6 items-center justify-center rounded-full",
      "border border-border text-muted",
    ].join(" "),
    addressTrigger: [
      "flex min-h-20 w-full items-start gap-3 rounded-2xl",
      "border border-border bg-transparent px-4 py-4 text-start shadow-none",
    ].join(" "),
    addressValue: "min-w-0 flex-1 whitespace-pre-wrap text-sm leading-6 text-foreground",
    addressPlaceholder: "min-w-0 flex-1 text-sm leading-6 text-muted",
    mapCanvas: "size-full",
    error: "text-sm text-danger",
    notice: "text-sm text-success",
    actions: "flex flex-col gap-3 pt-2",
    submit: "h-14 min-h-14 rounded-2xl",
    drawerBody: "flex flex-col gap-4 overflow-hidden pb-2",
    mapShell: "relative h-72 w-full overflow-hidden rounded-2xl",
    drawerRow: "grid grid-cols-2 gap-3",
    selectBtn: "min-h-12 w-full rounded-2xl text-base font-bold",
    selectIcon: "ms-2 size-5",
  },
});

export type ProfileSettingsFormSectionVariants = VariantProps<
  typeof profileSettingsFormSectionVariants
>;
