import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const profileSettingsEditSheetVariants = tv({
  slots: {
    body: "flex flex-col gap-4 overflow-hidden pb-2",
    field: "flex w-full flex-col gap-2",
    label: "text-sm font-bold text-foreground",
    inputGroup: [
      "h-[var(--field-height)] min-h-[var(--field-height)] w-full rounded-2xl border border-border",
      "bg-transparent px-4 shadow-none",
    ].join(" "),
    input:
      "h-[var(--field-height)] min-h-[var(--field-height)] min-w-0 flex-1 bg-transparent text-sm shadow-none",
    icon: "shrink-0 text-muted",
    hint: "text-xs leading-5 text-muted",
    mapShell: "relative h-72 w-full overflow-hidden rounded-2xl",
    mapCanvas: "size-full",
    drawerRow: "grid grid-cols-2 gap-3",
    wheel: [
      "mx-auto flex max-h-64 w-full max-w-xs flex-col gap-1 overflow-y-auto",
      "overscroll-contain py-2 [-webkit-overflow-scrolling:touch]",
    ].join(" "),
    wheelItem: [
      "flex h-auto min-h-0 w-full flex-col items-center justify-center gap-0.5",
      "rounded-2xl px-4 py-3 text-center text-base font-medium text-muted",
      "outline-none transition-colors",
      "data-[selected=true]:bg-accent/10 data-[selected=true]:font-semibold",
      "data-[selected=true]:text-accent data-[selected=true]:ring-1",
      "data-[selected=true]:ring-accent",
    ].join(" "),
    sliderBlock:
      "flex flex-col gap-2 overflow-hidden rounded-2xl border border-accent/25 bg-accent/[0.04] px-3 py-3",
    confirm: "w-full text-base font-bold",
    confirmIcon: "ms-2 size-5",
  },
});

export type ProfileSettingsEditSheetVariants = VariantProps<
  typeof profileSettingsEditSheetVariants
>;
