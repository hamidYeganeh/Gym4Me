import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const profileLocationsListSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-3",
    list: "flex flex-col gap-2.5",
    item: "flex w-full items-center gap-3 border border-border bg-surface text-start shadow-none",
    icon: "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent",
    copy: "flex min-w-0 flex-1 flex-col gap-1",
    label: "text-start text-foreground",
    line: "text-start text-muted",
    emptyText: "text-muted",
    status: "flex flex-col items-center gap-3 py-16",
    retry: "",
  },
});

export type ProfileLocationsListSectionVariants = VariantProps<
  typeof profileLocationsListSectionVariants
>;
