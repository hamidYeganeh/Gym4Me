import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const adminSectionHeaderVariants = tv({
  slots: {
    root: "flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6",
    tabs: "min-w-0",
    tabsListContainer: "rounded-none bg-transparent",
    tabsList:
      "gap-6 bg-transparent p-0 sm:gap-8 **:data-[slot=tabs-tab]:rounded-none **:data-[slot=tabs-tab]:bg-transparent **:data-[slot=tabs-tab]:px-0 **:data-[slot=tabs-tab]:pb-3 **:data-[slot=tabs-tab]:pt-0 **:data-[slot=tabs-tab]:text-sm **:data-[slot=tabs-tab]:font-medium **:data-[slot=tabs-tab]:text-muted **:data-[slot=tabs-tab]:opacity-100 **:data-[slot=tabs-tab]:shadow-none **:data-[slot=tabs-tab]:data-[hovered=true]:bg-transparent **:data-[slot=tabs-tab]:data-[hovered=true]:text-foreground **:data-[slot=tabs-tab]:data-[selected=true]:bg-transparent **:data-[slot=tabs-tab]:data-[selected=true]:text-foreground **:data-[slot=tabs-tab]:data-[selected=true]:shadow-none",
    tabIndicator:
      "rounded-none bg-accent shadow-[0_0_16px_4px_color-mix(in_oklab,var(--accent)_80%,transparent)]",
    search: "w-full sm:ms-auto sm:w-auto",
    // Force light field tokens so the white pill stays readable in app dark mode.
    searchGroup:
      "[color-scheme:light] min-h-11 rounded-full border-0 bg-white px-1 text-neutral-900 shadow-none [--field-background:white] [--field-foreground:#171717] [--field-placeholder:#a3a3a3]",
    searchIcon: "text-neutral-500",
    searchInput:
      "w-full min-w-0 text-neutral-900 placeholder:text-neutral-400 sm:w-64",
    filterButton:
      "shrink-0 text-neutral-500 outline-none data-[hovered=true]:bg-transparent data-[hovered=true]:text-neutral-800 data-[pressed=true]:opacity-70",
  },
});

export type AdminSectionHeaderVariants = VariantProps<
  typeof adminSectionHeaderVariants
>;
