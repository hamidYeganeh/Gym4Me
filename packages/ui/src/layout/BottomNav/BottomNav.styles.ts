import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const bottomNavVariants = tv({
  slots: {
    root: [
      "fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-50",
      "w-[calc(100%-2rem)] max-w-lg -translate-x-1/2",
      "isolate flex min-h-18 items-end justify-around overflow-visible",
      "rounded-[1.75rem] bg-surface/92 px-1.5 py-2",
      "shadow-[0_18px_48px_color-mix(in_oklch,var(--foreground)_14%,transparent)] backdrop-blur-2xl",
    ].join(" "),
    blur: "pointer-events-none absolute inset-0 z-0",
    item: "relative z-10 flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1",
    itemButton: [
      "flex size-10 items-center justify-center rounded-[0.875rem]",
      "bg-transparent text-current no-underline shadow-none",
      "hover:bg-transparent hover:opacity-90",
      "data-[hovered=true]:bg-transparent",
    ].join(" "),
    itemLabel: "max-w-full text-current",
    centerSlot:
      "relative z-50 -mt-7 flex shrink-0 items-end justify-center px-1 pb-1",
    centerAction: [
      "size-16 rounded-[1.375rem]",
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
      "rounded-[1.75rem] border-0 bg-surface p-0",
      "shadow-[0_18px_48px_color-mix(in_oklch,var(--foreground)_14%,transparent)]",
    ].join(" "),
    menuDialog: "relative p-4 sm:p-5",
    menuHeading: "sr-only",
    menuArrow: "fill-surface",
    menuGrid: "grid grid-cols-3 gap-x-1 gap-y-4",
    menuItem: "flex min-w-0 flex-col items-center gap-1.5",
    menuItemButton: [
      "flex size-12 items-center justify-center rounded-[1rem]",
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
