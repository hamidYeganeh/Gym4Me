import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const filterChipVariants = tv({
  slots: {
    root: [
      "shrink-0 gap-2 rounded-[var(--field-radius)] border border-solid px-4",
      "h-11 min-h-11 font-medium shadow-none",
      "transition-[background-color,border-color,color,transform] duration-fast ease-app",
      "outline-none data-[pressed=true]:scale-[0.98]",
      "[--button-bg:transparent]",
      "[--button-bg-hover:transparent]",
      "[--button-bg-pressed:transparent]",
    ].join(" "),
    icon: "inline-flex shrink-0 items-center justify-center [&_svg]:size-[1.125rem]",
    label: "text-sm font-semibold",
  },
  variants: {
    selected: {
      true: {},
      false: {
        root: [
          "border-border text-foreground",
          "[--button-fg:var(--foreground)]",
        ].join(" "),
        icon: "text-foreground",
        label: "text-foreground",
      },
    },
    selectedVariant: {
      outline: {},
      solid: {},
    },
  },
  compoundVariants: [
    {
      selected: true,
      selectedVariant: "outline",
      class: {
        root: [
          "border-accent bg-transparent text-accent",
          "[--button-fg:var(--accent)]",
          "[--button-bg:transparent]",
          "[--button-bg-hover:transparent]",
          "[--button-bg-pressed:transparent]",
        ].join(" "),
        icon: "text-accent",
        label: "text-accent",
      },
    },
    {
      selected: true,
      selectedVariant: "solid",
      class: {
        root: [
          "border-accent bg-accent text-accent-foreground",
          "[--button-bg:var(--accent)]",
          "[--button-bg-hover:var(--accent)]",
          "[--button-bg-pressed:var(--accent)]",
          "[--button-fg:var(--accent-foreground)]",
        ].join(" "),
        icon: "text-accent-foreground",
        label: "text-accent-foreground",
      },
    },
  ],
  defaultVariants: {
    selected: false,
    selectedVariant: "outline",
  },
});

export const filterChipBarVariants = tv({
  slots: {
    root: [
      "-mx-screen flex gap-2.5 overflow-x-auto px-screen pb-1",
      "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    ].join(" "),
  },
});

export type FilterChipVariantProps = VariantProps<typeof filterChipVariants>;
