import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const clubCancellationPolicyVariants = tv({
  slots: {
    root: [
      "w-full rounded-[24px] border-0 bg-surface-secondary p-5 shadow-none",
      "text-surface-foreground",
    ].join(" "),
    title: "mb-5 text-lg font-bold text-foreground",
    list: "m-0 flex list-none flex-col p-0",
    item: "relative flex gap-4",
    rail: "relative flex w-5 shrink-0 flex-col items-center",
    node: [
      "relative z-[1] flex size-5 shrink-0 items-center justify-center rounded-full",
    ].join(" "),
    nodeDot: "size-1.5 rounded-full",
    connector: "w-0.5 flex-1 min-h-8 bg-default",
    content: "min-w-0 flex-1 pb-8",
    stepTitle: "text-lg font-bold leading-snug",
    stepDescription: "mt-1 text-sm leading-relaxed text-muted",
  },
  variants: {
    status: {
      completed: {},
      current: {},
      pending: {},
    },
    color: {
      success: {
        stepTitle: "text-success",
      },
      warning: {
        stepTitle: "text-warning",
      },
      danger: {
        stepTitle: "text-danger",
      },
      accent: {
        stepTitle: "text-accent",
      },
    },
    isLast: {
      true: {
        content: "pb-0",
      },
      false: {},
    },
  },
  compoundVariants: [
    {
      status: "completed",
      color: "success",
      class: {
        node: "bg-success",
        nodeDot: "bg-success-foreground",
        connector: "bg-success",
      },
    },
    {
      status: "current",
      color: "success",
      class: {
        node: "border-2 border-success bg-surface-secondary",
        nodeDot: "bg-success",
      },
    },
    {
      status: "pending",
      color: "success",
      class: {
        node: "bg-success/25",
        nodeDot: "bg-success/70",
      },
    },
    {
      status: "completed",
      color: "warning",
      class: {
        node: "bg-warning",
        nodeDot: "bg-warning-foreground",
        connector: "bg-warning",
      },
    },
    {
      status: "current",
      color: "warning",
      class: {
        node: "border-2 border-warning bg-surface-secondary",
        nodeDot: "bg-warning",
      },
    },
    {
      status: "pending",
      color: "warning",
      class: {
        node: "bg-warning/25",
        nodeDot: "bg-warning/70",
      },
    },
    {
      status: "completed",
      color: "danger",
      class: {
        node: "bg-danger",
        nodeDot: "bg-danger-foreground",
        connector: "bg-danger",
      },
    },
    {
      status: "current",
      color: "danger",
      class: {
        node: "border-2 border-danger bg-surface-secondary",
        nodeDot: "bg-danger",
      },
    },
    {
      status: "pending",
      color: "danger",
      class: {
        node: "bg-danger/25",
        nodeDot: "bg-danger/70",
      },
    },
    {
      status: "completed",
      color: "accent",
      class: {
        node: "bg-accent",
        nodeDot: "bg-accent-foreground",
        connector: "bg-accent",
      },
    },
    {
      status: "current",
      color: "accent",
      class: {
        node: "border-2 border-accent bg-surface-secondary",
        nodeDot: "bg-accent",
      },
    },
    {
      status: "pending",
      color: "accent",
      class: {
        node: "bg-accent/25",
        nodeDot: "bg-accent/70",
      },
    },
  ],
  defaultVariants: {
    status: "pending",
    color: "accent",
    isLast: false,
  },
});

export type ClubCancellationPolicyVariantProps = VariantProps<
  typeof clubCancellationPolicyVariants
>;
