import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const sportSelectCardVariants = tv({
  slots: {
    root: [
      "relative !flex !h-auto min-h-0 !w-full min-w-0 flex-col items-center justify-center !gap-2.5",
      "rounded-[20px] !px-5 !py-3",
      "border border-solid shadow-none whitespace-normal",
      "[--toggle-button-bg:transparent]",
      "[--toggle-button-bg-hover:transparent]",
      "[--toggle-button-bg-pressed:transparent]",
      "[--toggle-button-bg-selected:transparent]",
      "[--toggle-button-bg-selected-hover:transparent]",
      "[--toggle-button-bg-selected-pressed:transparent]",
      "transition-[border-color,background-color,color,transform] duration-fast ease-app",
      "outline-none data-[pressed=true]:!scale-[0.98]",
    ].join(" "),
    icon: "flex size-8 shrink-0 items-center justify-center [&_svg]:size-8",
    label: "text-center text-sm font-bold leading-tight",
  },
  variants: {
    selected: {
      true: {
        root: [
          "!border-2 !border-accent !bg-accent/10",
          "[--toggle-button-fg:var(--accent)]",
          "[--toggle-button-fg-selected:var(--accent)]",
          "text-accent",
        ].join(" "),
        icon: "text-accent",
        label: "text-accent",
      },
      false: {
        root: [
          "!border !border-border !bg-surface",
          "[--toggle-button-fg:var(--foreground)]",
          "text-foreground data-[hovered=true]:!border-muted",
        ].join(" "),
        icon: "text-foreground",
        label: "text-foreground",
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});

export type SportSelectCardVariantProps = VariantProps<
  typeof sportSelectCardVariants
>;
