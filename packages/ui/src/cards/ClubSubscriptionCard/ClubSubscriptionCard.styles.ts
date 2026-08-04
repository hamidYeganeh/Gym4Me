import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const clubSubscriptionCardVariants = tv({
  slots: {
    root: [
      "relative w-full cursor-pointer overflow-visible rounded-[24px] border border-accent p-4",
      "bg-background text-foreground transition-[opacity,transform] duration-fast ease-app",
      "outline-none data-[pressed=true]:scale-[0.99]",
    ].join(" "),
    badge: [
      "absolute -top-3 end-4 z-10 h-7 max-w-full gap-0 border-0 px-3",
      "rounded-full uppercase tracking-wide",
      "[&_.chip__label]:text-xs [&_.chip__label]:font-bold",
    ].join(" "),
    body: "flex w-full min-w-0 items-center justify-between gap-4 p-0",
    content: "flex min-w-0 flex-1 flex-col gap-1 p-0",
    planName: "text-sm font-bold tracking-wide uppercase text-foreground",
    priceRow: "flex min-w-0 flex-wrap items-baseline gap-1",
    price: "text-2xl font-bold tracking-tight text-foreground",
    priceSuffix: "text-base font-normal text-muted",
    description: "text-sm text-muted",
    action: [
      "mt-1 inline-flex h-auto min-h-0 w-fit items-center rounded-md !px-0 !py-0",
      "text-sm font-bold text-accent shadow-none",
      "hover:bg-transparent hover:opacity-90",
      "pressed:bg-transparent data-[pressed=true]:bg-transparent",
      "data-[pressed=true]:scale-[0.98]",
    ].join(" "),
    status: [
      "flex size-8 shrink-0 items-center justify-center rounded-full",
      "[&_svg]:size-[18px]",
    ].join(" "),
  },
  variants: {
    hasBadge: {
      true: { root: "mt-3" },
      false: {},
    },
    hasControl: {
      true: {},
      false: {},
    },
    selected: {
      true: {
        root: "border-accent",
      },
      false: {
        root: "border-accent/50",
      },
    },
  },
  compoundVariants: [
    {
      hasControl: false,
      selected: true,
      class: {
        status: "border-0 bg-accent text-accent-foreground",
      },
    },
    {
      hasControl: false,
      selected: false,
      class: {
        status: "border-2 border-accent bg-transparent text-transparent",
      },
    },
  ],
  defaultVariants: {
    hasBadge: false,
    hasControl: false,
    selected: false,
  },
});

export type ClubSubscriptionCardVariantProps = VariantProps<
  typeof clubSubscriptionCardVariants
>;
