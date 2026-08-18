import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const unitsSettingsScreenVariants = tv({
  slots: {
    root: "bg-background before:hidden",
    content: "flex flex-col gap-6 pb-12 pt-2",
    status: "flex flex-col items-center gap-3 py-16",
    empty: "text-center text-muted",
    retry: "min-h-12",
  },
});

export type UnitsSettingsScreenVariants = VariantProps<
  typeof unitsSettingsScreenVariants
>;
