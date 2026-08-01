import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const bottomNavVariants = tv({
  slots: {
    root: [
      "fixed inset-x-0 bottom-0 z-50",
      "flex items-end justify-around",
      "bg-linear-to-t from-background to-transparent",
      "px-1 pt-10 pb-[max(0.5rem,env(safe-area-inset-bottom))]",
    ].join(" "),
    item: "flex min-w-0 flex-1 flex-col items-center gap-1 py-1",
    itemButton: [
      "flex size-10 items-center justify-center rounded-full",
      "bg-transparent text-current no-underline shadow-none",
      "hover:bg-transparent hover:opacity-90",
      "data-[hovered=true]:bg-transparent",
    ].join(" "),
    itemLabel: "max-w-full text-current",
    centerSlot: "relative z-50 flex shrink-0 items-end justify-center px-1 pb-1",
    centerAction: [
      "size-14 rounded-full",
      "bg-accent text-accent-foreground",
      "shadow-lg shadow-accent/35",
      "hover:bg-accent/90 data-[hovered=true]:bg-accent/90",
    ].join(" "),
    centerActionLabel: "sr-only",
    backdrop: [
      "fixed inset-0 z-40",
      "bg-background/50 backdrop-blur-md",
    ].join(" "),
    menu: [
      "z-50 w-[min(20.5rem,calc(100vw-2rem))] overflow-visible",
      "rounded-3xl border-0 bg-surface p-0",
      "shadow-xl shadow-black/10",
    ].join(" "),
    menuDialog: "relative p-4 sm:p-5",
    menuHeading: "sr-only",
    menuArrow: "fill-surface",
    menuGrid: "grid grid-cols-3 gap-x-1 gap-y-4",
    menuItem: "flex min-w-0 flex-col items-center gap-1.5",
    menuItemButton: [
      "flex size-12 items-center justify-center rounded-full",
      "bg-default text-foreground no-underline shadow-none",
      "hover:bg-default/80 data-[hovered=true]:bg-default/80",
    ].join(" "),
    menuItemLabel: "max-w-full px-0.5 text-foreground",
  },
  variants: {
    isActive: {
      true: { item: "text-accent" },
      false: { item: "text-muted" },
    },
  },
  defaultVariants: {
    isActive: false,
  },
});

export type BottomNavVariantProps = VariantProps<typeof bottomNavVariants>;
