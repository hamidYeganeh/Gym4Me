import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const clubLocationCardVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-3",
    header: "flex flex-wrap items-center gap-2.5",
    statusChip: "h-7 rounded-full border-0 px-2.5 shadow-none",
    hours: "text-[0.8rem] tabular-nums tracking-tight text-muted",
    card: [
      "flex w-full items-stretch overflow-hidden rounded-[1.75rem] p-0",
      "border border-border/70 bg-default text-default-foreground shadow-none",
    ].join(" "),
    body: "flex w-full items-stretch",
    cell: [
      "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-2",
      "px-2 py-5",
      "after:absolute after:end-0 after:top-[18%] after:bottom-[18%] after:w-px after:bg-border",
      "last:after:hidden",
    ].join(" "),
    valueStack: "flex flex-col items-center gap-0.5 text-center",
    value: "text-[1.65rem] leading-none tracking-tight text-foreground",
    unit: "text-[0.7rem] font-medium leading-none tracking-tight text-foreground/80",
    meta: "flex items-center gap-1.5 text-muted",
    icon: "shrink-0 text-muted",
    iconScore: "shrink-0 text-accent",
    iconStudents: "shrink-0 text-accent",
    label: "text-[0.8rem] leading-none text-muted",
  },
  variants: {
    status: {
      open: {
        statusChip: [
          "bg-success/15 text-success",
          "[--chip-bg:color-mix(in_oklch,var(--success)_15%,transparent)]",
          "[--chip-fg:var(--success)]",
        ].join(" "),
      },
      closed: {
        statusChip: [
          "bg-danger/15 text-danger",
          "[--chip-bg:color-mix(in_oklch,var(--danger)_15%,transparent)]",
          "[--chip-fg:var(--danger)]",
        ].join(" "),
      },
    },
  },
});

export type ClubLocationCardVariantProps = VariantProps<
  typeof clubLocationCardVariants
>;
