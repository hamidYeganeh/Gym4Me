import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const emptyStateVariants = tv({
  slots: {
    root: "flex w-full flex-col items-center text-center",
    media:
      "relative mb-6 flex w-full max-w-[17.5rem] items-center justify-center",
    illustration:
      "pointer-events-none max-h-56 w-full object-contain select-none sm:max-h-64",
    iconCircle:
      "mb-6 flex size-20 items-center justify-center rounded-full sm:size-24",
    icon: "size-12 shrink-0 sm:size-14",
    badge: [
      "mb-4 h-8 max-w-full gap-1.5 rounded-full border-0 px-3",
      "[&_.chip__label]:text-xs [&_.chip__label]:font-semibold",
    ].join(" "),
    badgeIcon: "size-3.5 shrink-0",
    copy: "flex w-full max-w-md flex-col items-center gap-2 px-1",
    title: "tracking-tight text-foreground",
    description: "text-balance text-muted",
    actions: "mt-8 flex w-full max-w-md flex-col items-center gap-3",
    primaryAction: "rounded-full",
    secondaryAction: [
      "h-auto min-h-0 w-fit rounded-md !px-0 !py-0",
      "text-sm font-semibold text-accent shadow-none",
      "hover:bg-transparent hover:opacity-90",
      "data-[pressed=true]:bg-transparent data-[pressed=true]:scale-[0.98]",
    ].join(" "),
    suggestions:
      "mt-8 flex w-full max-w-lg flex-wrap items-center justify-center gap-2",
    suggestion: [
      "h-10 max-w-full gap-1.5 rounded-full border border-border bg-transparent px-4",
      "text-foreground shadow-none",
      "hover:bg-surface data-[hovered=true]:bg-surface",
      "data-[pressed=true]:scale-[0.98]",
    ].join(" "),
    suggestionIcon: "size-4 shrink-0 text-foreground",
  },
  variants: {
    status: {
      neutral: {
        iconCircle: "bg-default text-foreground",
        badge: [
          "[--chip-bg:color-mix(in_oklch,var(--foreground)_10%,var(--surface))]",
          "[--chip-fg:var(--foreground)]",
        ].join(" "),
        badgeIcon: "text-foreground",
      },
      success: {
        iconCircle:
          "bg-[color-mix(in_oklch,var(--success)_22%,transparent)] text-success",
        badge: [
          "[--chip-bg:color-mix(in_oklch,var(--success)_18%,transparent)]",
          "[--chip-fg:var(--success)]",
        ].join(" "),
        badgeIcon: "text-success",
      },
      danger: {
        iconCircle:
          "bg-[color-mix(in_oklch,var(--danger)_22%,transparent)] text-danger",
        badge: [
          "[--chip-bg:color-mix(in_oklch,var(--danger)_18%,transparent)]",
          "[--chip-fg:var(--danger)]",
        ].join(" "),
        badgeIcon: "text-danger",
      },
      warning: {
        iconCircle:
          "bg-[color-mix(in_oklch,var(--warning)_22%,transparent)] text-warning",
        badge: [
          "[--chip-bg:color-mix(in_oklch,var(--warning)_18%,transparent)]",
          "[--chip-fg:var(--warning)]",
        ].join(" "),
        badgeIcon: "text-warning",
      },
      accent: {
        iconCircle:
          "bg-[color-mix(in_oklch,var(--accent)_22%,transparent)] text-accent",
        badge: [
          "[--chip-bg:color-mix(in_oklch,var(--accent)_18%,transparent)]",
          "[--chip-fg:var(--accent)]",
        ].join(" "),
        badgeIcon: "text-accent",
      },
    },
    layout: {
      media: {
        root: "py-6",
      },
      icon: {
        root: "py-8",
      },
      compact: {
        root: "justify-end gap-0 py-10",
        copy: "mt-0",
        actions: "mt-10",
      },
    },
  },
  defaultVariants: {
    status: "neutral",
    layout: "media",
  },
});

export type EmptyStateVariantProps = VariantProps<typeof emptyStateVariants>;
