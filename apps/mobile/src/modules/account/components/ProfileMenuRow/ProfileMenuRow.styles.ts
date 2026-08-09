import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const profileMenuRowVariants = tv({
  slots: {
    root: [
      "flex w-full items-center gap-3 rounded-[1.5rem] border border-border",
      "bg-surface px-4 py-3.5 text-start",
    ].join(" "),
    pressable: "h-auto justify-start font-normal",
    icon: "flex size-10 shrink-0 items-center justify-center text-accent",
    body: "flex min-w-0 flex-1 flex-col gap-0.5",
    label: "text-foreground",
    hint: "text-muted",
    trailing: "flex shrink-0 items-center gap-2",
    badge:
      "inline-flex min-w-6 items-center justify-center rounded-full bg-default px-1.5 py-0.5 text-xs font-semibold text-foreground",
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
  },
  defaultVariants: {
    tone: "default",
  },
});

export type ProfileMenuRowVariants = VariantProps<
  typeof profileMenuRowVariants
>;
