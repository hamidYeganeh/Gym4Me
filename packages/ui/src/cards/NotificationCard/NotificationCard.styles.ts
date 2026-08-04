import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const notificationCardVariants = tv({
  slots: {
    root: [
      "flex w-full gap-3 rounded-[28px] border border-border bg-surface",
      "p-4 text-start sm:gap-4 sm:rounded-[32px] sm:p-5",
    ].join(" "),
    iconWrap: [
      "flex size-12 shrink-0 items-center justify-center rounded-full",
      "bg-default text-foreground [&_svg]:size-5",
    ].join(" "),
    body: "flex min-w-0 flex-1 flex-col gap-2",
    header: "flex min-w-0 items-baseline justify-between gap-3",
    title: "min-w-0 flex-1 text-foreground",
    description: "text-muted",
    timestamp: "shrink-0 text-muted",
    progress: "w-full gap-0",
    track: "h-2 w-full overflow-hidden rounded-full bg-default",
    fill: "h-full rounded-full bg-accent",
    badge: [
      "h-8 w-fit max-w-full gap-1.5 rounded-full border border-border",
      "bg-transparent px-3 text-foreground",
      "[&_.chip__label]:text-xs [&_.chip__label]:font-semibold",
    ].join(" "),
    badgeIcon: "size-3.5 shrink-0 text-foreground",
    badgeDot: "size-3.5 shrink-0 rounded-full border-2 border-current",
    actions: "flex flex-wrap items-center gap-4 pt-0.5",
    primaryAction: [
      "h-auto min-h-0 w-fit rounded-md !px-0 !py-0",
      "text-sm font-bold text-accent shadow-none",
      "hover:bg-transparent hover:opacity-90",
      "data-[pressed=true]:bg-transparent data-[pressed=true]:scale-[0.98]",
    ].join(" "),
    secondaryAction: [
      "h-auto min-h-0 w-fit rounded-md !px-0 !py-0",
      "text-sm font-bold text-foreground shadow-none",
      "hover:bg-transparent hover:opacity-90",
      "data-[pressed=true]:bg-transparent data-[pressed=true]:scale-[0.98]",
    ].join(" "),
    media: [
      "mt-1 min-h-28 w-full overflow-hidden rounded-2xl",
      "border border-border bg-background",
    ].join(" "),
  },
  variants: {
    align: {
      center: { root: "items-center" },
      start: { root: "items-start" },
    },
  },
  defaultVariants: {
    align: "center",
  },
});

export type NotificationCardVariantProps = VariantProps<
  typeof notificationCardVariants
>;
