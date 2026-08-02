import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const fileItemTypeVariants = tv({
  slots: {
    root: "relative inline-block shrink-0",
    svg: "block size-full overflow-visible",
    sheet: "fill-default stroke-border",
    fold: "fill-surface-tertiary stroke-border",
    mark: "fill-border stroke-border",
    badge: "fill-[var(--file-type-badge)]",
    badgeLabel:
      "fill-stats-foreground font-bold uppercase [dominant-baseline:central]",
  },
  variants: {
    type: {
      PDF: { root: "[--file-type-badge:var(--danger)]" },
      DOC: { root: "[--file-type-badge:var(--stats-purple)]" },
      XLS: { root: "[--file-type-badge:var(--stats-orange)]" },
      PPT: { root: "[--file-type-badge:var(--accent)]" },
      CSS: { root: "[--file-type-badge:var(--stats-orange)]" },
      JPG: { root: "[--file-type-badge:var(--stats-blue)]" },
      PSD: { root: "[--file-type-badge:var(--foreground)]" },
      AI: { root: "[--file-type-badge:var(--accent)]" },
      MP4: { root: "[--file-type-badge:var(--success)]" },
      MP3: { root: "[--file-type-badge:var(--stats-purple)]" },
    },
    size: {
      "2xl": { root: "h-[72px] w-[65px]", badgeLabel: "text-[11px]" },
      xl: { root: "h-16 w-[58px]", badgeLabel: "text-[10px]" },
      md: { root: "h-14 w-[51px]", badgeLabel: "text-[9px]" },
      sm: { root: "h-12 w-[43px]", badgeLabel: "text-[8px]" },
      xs: { root: "h-10 w-[36px]", badgeLabel: "text-[7px]" },
      "2xs": { root: "h-8 w-[29px]", badgeLabel: "text-[6px]" },
    },
  },
  defaultVariants: {
    type: "DOC",
    size: "md",
  },
});

export type FileItemTypeVariantProps = VariantProps<typeof fileItemTypeVariants>;
