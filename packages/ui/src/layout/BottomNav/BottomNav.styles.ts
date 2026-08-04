import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const bottomNavVariants = tv({
  slots: {
    root: [
      "fixed bottom-0 left-1/2 z-50 w-full max-w-xl -translate-x-1/2",
      "isolate flex items-end justify-around overflow-hidden",
      "bg-linear-to-t from-background to-transparent",
      "px-1 pt-10 pb-[max(0.5rem,env(safe-area-inset-bottom))]",
    ].join(" "),
    blur: "pointer-events-none absolute inset-0 z-0",
    item: "relative z-10 flex min-w-0 flex-1 flex-col items-center gap-1 py-1",
    itemButton: [
      "flex size-10 items-center justify-center rounded-full",
      "bg-transparent text-current no-underline shadow-none",
      "hover:bg-transparent hover:opacity-90",
      "data-[hovered=true]:bg-transparent",
    ].join(" "),
    itemLabel: "max-w-full text-current",
    centerSlot:
      "relative z-50 flex shrink-0 items-end justify-center px-1 pb-1",
    centerAction: [
      "size-16 rounded-full",
      "bg-accent text-accent-foreground",
      "shadow-lg shadow-accent/35",
      "hover:bg-accent/90 data-[hovered=true]:bg-accent/90",
      /* HeroUI Button forces svg to size-5; keep the logo at 48px */
      "[&_svg]:pointer-events-none [&_svg]:!m-0 [&_svg]:!size-12",
    ].join(" "),
    centerActionIcon: [
      "inline-flex size-12 items-center justify-center",
      "transition-transform duration-300 ease",
      "will-change-transform",
    ].join(" "),
    centerActionLabel: "sr-only",
    backdrop: [
      "fixed inset-y-0 left-1/2 z-40 w-full max-w-xl -translate-x-1/2",
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
    isActionsOpen: {
      true: { centerActionIcon: "-rotate-45" },
      false: { centerActionIcon: "rotate-0" },
    },
  },
  defaultVariants: {
    isActive: false,
    isActionsOpen: false,
  },
});

export type BottomNavVariantProps = VariantProps<typeof bottomNavVariants>;
