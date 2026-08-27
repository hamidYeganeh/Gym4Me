import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const profileGenderScreenVariants = tv({
  slots: {
    root: "bg-background before:hidden",
    content: "flex flex-1 flex-col gap-8 pb-12 pt-4",
    picker: "flex flex-1 flex-col items-center justify-center",
    status: "flex flex-col items-center gap-3 py-16 text-center",
    error: "text-danger",
    actions: "mt-auto flex flex-col gap-2",
  },
});

export type ProfileGenderScreenVariants = VariantProps<
  typeof profileGenderScreenVariants
>;
