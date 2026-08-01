import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const callToActionCardVariants = tv({
  slots: {
    root: "flex h-[116px] items-center justify-between gap-4 rounded-[32px] p-6 text-start",
    content: "flex min-w-0 flex-col gap-1",
    subtitle: "truncate opacity-95",
    title: "truncate tracking-tight",
    action:
      "shrink-0 transition-opacity duration-fast ease-app outline-none data-[pressed=true]:scale-[0.97]",
  },
  variants: {
    variant: {
      primary: {
        root: "bg-accent text-accent-foreground",
        title: "text-accent-foreground",
        subtitle: "text-accent-foreground/95",
      },
      outlined: {
        root: "border-2 border-accent bg-transparent text-accent",
        title: "text-accent",
        subtitle: "text-accent/95",
      },
    },
    actionType: {
      plus: {
        action: "size-12 rounded-full",
      },
      icon: {
        action: "size-14 rounded-[18px] ring-4",
      },
    },
  },
  compoundVariants: [
    {
      variant: "primary",
      actionType: "plus",
      class: {
        action: "bg-accent-foreground text-accent hover:opacity-90",
      },
    },
    {
      variant: "outlined",
      actionType: "plus",
      class: {
        action: "bg-accent text-accent-foreground hover:opacity-90",
      },
    },
    {
      variant: "primary",
      actionType: "icon",
      class: {
        action:
          "bg-accent-foreground text-accent ring-accent-foreground/35 hover:opacity-90",
      },
    },
    {
      variant: "outlined",
      actionType: "icon",
      class: {
        action:
          "bg-accent/10 text-accent ring-accent/20 hover:opacity-90",
      },
    },
  ],
  defaultVariants: {
    variant: "primary",
    actionType: "plus",
  },
});

export type CallToActionCardVariantProps = VariantProps<
  typeof callToActionCardVariants
>;
