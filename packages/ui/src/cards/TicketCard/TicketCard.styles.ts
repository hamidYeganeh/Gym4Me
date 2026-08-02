import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const ticketCardVariants = tv({
  slots: {
    root: [
      "relative h-[320px] w-[200px] shrink-0 overflow-hidden rounded-[24px]",
      "border-0 bg-default p-0 shadow-none",
      "text-foreground",
    ].join(" "),
    pattern: "pointer-events-none absolute inset-0 overflow-hidden",
    patternSvg: [
      "absolute left-1/2 top-1/2 h-[200%] w-[575%]",
      "-translate-x-1/2 -translate-y-1/2 -scale-x-100 rotate-[135deg]",
    ].join(" "),
    header: [
      "absolute inset-x-0 top-0 z-[1] flex items-start justify-between",
      "px-6 pt-6",
    ].join(" "),
    paymentBadge: [
      "flex h-[34px] w-12 shrink-0 items-center justify-center",
      "rounded-lg border border-border bg-surface",
    ].join(" "),
    paymentLogo: "h-[14px] w-[26px]",
    contactless: "flex size-8 shrink-0 items-center justify-center text-foreground",
    contactlessIcon: "size-7",
    mark: [
      "absolute left-1/2 top-1/2 z-[1] flex size-16 -translate-x-1/2 -translate-y-1/2",
      "items-center justify-center text-accent",
    ].join(" "),
    footer: [
      "absolute inset-x-0 bottom-0 z-[1] flex flex-col gap-3",
      "px-6 pb-6",
    ].join(" "),
    skeletonShort: "h-4 w-[72px] rounded-full bg-border",
    skeletonLong: "h-4 w-[152px] max-w-full rounded-full bg-border",
    title: "truncate text-sm font-bold text-foreground",
    subtitle: "truncate text-xs text-muted",
  },
});

export type TicketCardVariantProps = VariantProps<typeof ticketCardVariants>;
