import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const profileSettingsFieldRowVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-2",
    label: "text-sm font-bold text-foreground",
    trigger: [
      "flex w-full items-center gap-3 rounded-2xl border border-border",
      "bg-transparent px-4 text-start shadow-none",
      "data-[hovered=true]:bg-default/40",
    ].join(" "),
    icon: "shrink-0 text-muted",
    value: "min-w-0 flex-1 truncate text-sm text-foreground",
    placeholder: "min-w-0 flex-1 truncate text-sm text-muted",
    trailing: "shrink-0 text-muted",
    help: [
      "flex size-6 items-center justify-center rounded-full",
      "border border-border text-muted",
    ].join(" "),
  },
  variants: {
    locked: {
      true: {
        trigger: "opacity-80 data-[hovered=true]:bg-transparent",
      },
      false: {},
    },
    multiline: {
      true: {
        trigger: "min-h-20 items-start py-4",
        value: "whitespace-pre-wrap leading-6",
        placeholder: "leading-6",
      },
      false: {
        trigger: "h-14 min-h-14",
      },
    },
  },
  defaultVariants: {
    locked: false,
    multiline: false,
  },
});

export type ProfileSettingsFieldRowVariants = VariantProps<
  typeof profileSettingsFieldRowVariants
>;
