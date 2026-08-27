import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const profileMenuRowVariants = tv({
  slots: {
    root: [
      "flex h-16 min-h-16 w-full items-center gap-3 overflow-hidden rounded-2xl",
      "bg-surface-secondary px-4 text-start shadow-none",
    ].join(" "),
    pressable: "h-16 min-h-16 justify-start px-4 font-normal",
    icon: "flex size-6 shrink-0 items-center justify-center text-accent",
    body: "flex min-w-0 flex-1 flex-col justify-center gap-0.5",
    label: "truncate leading-none text-foreground",
    hint: "truncate text-[11px] leading-tight text-muted",
    trailing: "flex shrink-0 items-center gap-2",
    badge:
      "inline-flex min-w-6 items-center justify-center rounded-full bg-accent/15 px-1.5 py-0.5 text-[11px] font-semibold text-accent",
    chevron: "shrink-0 text-muted",
  },
  variants: {
    tone: {
      default: {},
      danger: {
        label: "text-danger",
        icon: "text-danger",
      },
    },
    isDisabled: {
      true: {
        root: "pointer-events-none select-none opacity-50",
        icon: "text-muted",
        label: "text-muted",
      },
      false: {},
    },
  },
  defaultVariants: {
    tone: "default",
    isDisabled: false,
  },
});

export type ProfileMenuRowVariants = VariantProps<
  typeof profileMenuRowVariants
>;
