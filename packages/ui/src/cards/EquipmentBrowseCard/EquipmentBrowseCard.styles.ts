import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const equipmentBrowseCardVariants = tv({
  slots: {
    root: [
      "relative !inline-flex h-20 items-center justify-center overflow-hidden",
      "rounded-full border-0 bg-default p-0 shadow-none",
      "text-foreground whitespace-normal",
      "transition-transform duration-fast ease-app data-[pressed=true]:scale-[0.98]",
    ].join(" "),
    image: "pointer-events-none absolute inset-0 size-full object-cover select-none",
    scrim: [
      "pointer-events-none absolute inset-0",
      "bg-foreground/45",
    ].join(" "),
    label: [
      "relative z-10 px-4 text-center text-sm font-bold leading-tight",
      "tracking-tight text-white",
    ].join(" "),
  },
  variants: {
    size: {
      sm: { root: "min-w-[6.5rem] flex-[1_1_28%]" },
      md: { root: "min-w-[7.5rem] flex-[1_1_30%]" },
      lg: { root: "min-w-[10rem] flex-[1_1_55%]" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type EquipmentBrowseCardVariantProps = VariantProps<
  typeof equipmentBrowseCardVariants
>;
