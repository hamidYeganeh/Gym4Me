import { tv } from "tailwind-variants";

export const discoveryClubsReserveTimeStepSectionVariants = tv({
  slots: {
    section: "flex flex-col gap-3",
    sectionHeader: "flex items-center justify-between gap-3",
    sectionTitle: "text-foreground",
    sectionHint: "text-muted",
    days: [
      "-mx-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-1",
      "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    ].join(" "),
    slotsGrid: "grid grid-cols-1 gap-2.5",
    slot: [
      "flex h-auto w-full flex-row items-center gap-3",
      "rounded-[1.25rem] border-0 bg-surface px-3.5 py-3.5 text-start",
      "transition-[border-color,background-color,box-shadow]",
      "[--button-bg:var(--surface)]",
      "[--button-bg-hover:color-mix(in_oklab,var(--accent)_8%,var(--surface))]",
      "[--button-bg-pressed:color-mix(in_oklab,var(--accent)_12%,var(--surface))]",
    ].join(" "),
    slotSelected: [
      "border-accent",
      "bg-[color-mix(in_oklab,var(--accent)_12%,var(--surface))]",
      "ring-2 ring-accent/20",
      "[--button-bg:color-mix(in_oklab,var(--accent)_12%,var(--surface))]",
      "[--button-bg-hover:color-mix(in_oklab,var(--accent)_16%,var(--surface))]",
      "[--button-bg-pressed:color-mix(in_oklab,var(--accent)_18%,var(--surface))]",
    ].join(" "),
    slotDisabled: "opacity-55",
    slotIconWrap: [
      "flex size-11 shrink-0 items-center justify-center rounded-full",
      "bg-default text-accent",
    ].join(" "),
    slotIconWrapSelected: "bg-accent text-accent-foreground",
    slotBody: "flex min-w-0 flex-1 flex-col items-start gap-1",
    slotTime: "text-foreground",
    slotCapacity: "text-muted",
    slotCapacityLow: "text-warning",
    slotCapacityFull: "text-danger",
    slotCheck: "shrink-0 text-accent",
    empty: [
      "flex w-full flex-col items-center gap-2 rounded-2xl border border-border/60",
      "bg-surface px-6 py-10 text-center",
    ].join(" "),
    emptyBody: "text-muted",
  },
});

export function getSlotCapacityClassName(
  state: "available" | "low" | "full",
  slots: ReturnType<typeof discoveryClubsReserveTimeStepSectionVariants>,
): string {
  if (state === "low") return slots.slotCapacityLow();
  if (state === "full") return slots.slotCapacityFull();
  return slots.slotCapacity();
}
