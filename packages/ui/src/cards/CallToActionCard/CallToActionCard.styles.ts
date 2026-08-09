import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const callToActionCardVariants = tv({
  slots: {
    root: "flex h-[116px] items-center justify-between gap-4 rounded-[32px] p-6 text-start",
    content: "flex min-w-0 flex-col gap-1",
    subtitle: "truncate opacity-95",
    meta: "ms-1 font-normal text-muted",
    title: "truncate tracking-tight",
    badge:
      "mt-2 h-7 w-fit max-w-full border-0 px-3 [&_.chip__label]:text-xs [&_.chip__label]:font-bold",
    actionRing: "hidden",
    action:
      "shrink-0 transition-opacity duration-fast ease-app outline-none data-[pressed=true]:scale-[0.97]",
  },
  variants: {
    variant: {
      primary: {
        root: "bg-accent text-accent-foreground",
        title: "text-accent-foreground",
        subtitle: "text-accent-foreground/95",
      },
      outlined: {
        root: "border-2 border-accent bg-transparent text-accent",
        title: "text-accent",
        subtitle: "text-accent/95",
      },
      soft: {
        root: [
          "h-auto min-h-[132px] items-center gap-5",
          "bg-[color-mix(in_oklab,var(--stats-blue)_12%,var(--surface))] text-foreground",
        ].join(" "),
        content: "gap-1.5",
        title: "text-base font-bold uppercase tracking-wide text-foreground",
        subtitle: "text-sm font-semibold text-foreground",
        meta: "font-normal text-muted",
        badge: "rounded-full",
        actionRing: [
          "flex size-[88px] shrink-0 items-center justify-center rounded-full",
          "border border-dashed border-foreground/70",
        ].join(" "),
        action:
          "size-11 rounded-full bg-foreground text-background hover:opacity-90",
      },
    },
    actionType: {
      plus: {
        action: "size-12 rounded-full",
      },
      icon: {
        action: "size-14 rounded-[18px] ring-4",
      },
      button: {
        root: "h-auto min-h-[104px] px-7 py-5",
        content: "gap-0.5",
        title: "text-[1.75rem] leading-tight",
        actionRing: "hidden",
        action: [
          "h-14 shrink-0 rounded-2xl px-6 font-bold shadow-none",
          "transition-opacity duration-fast ease-app",
          "data-[pressed=true]:scale-[0.98]",
        ].join(" "),
      },
    },
  },
  compoundVariants: [
    {
      variant: "primary",
      actionType: "plus",
      class: {
        action: "bg-accent-foreground text-accent hover:opacity-90",
      },
    },
    {
      variant: "outlined",
      actionType: "plus",
      class: {
        action: "bg-accent text-accent-foreground hover:opacity-90",
      },
    },
    {
      variant: "primary",
      actionType: "icon",
      class: {
        action:
          "bg-accent-foreground text-accent ring-accent-foreground/35 hover:opacity-90",
      },
    },
    {
      variant: "outlined",
      actionType: "icon",
      class: {
        action:
          "bg-accent/10 text-accent ring-accent/20 hover:opacity-90",
      },
    },
    {
      variant: "primary",
      actionType: "button",
      class: {
        action:
          "bg-accent-foreground text-accent hover:opacity-90",
      },
    },
    {
      variant: "outlined",
      actionType: "button",
      class: {
        action: "bg-accent text-accent-foreground hover:opacity-90",
      },
    },
    {
      variant: "soft",
      actionType: "plus",
      class: {
        action:
          "size-11 rounded-full bg-foreground text-background hover:opacity-90",
      },
    },
    {
      variant: "soft",
      actionType: "icon",
      class: {
        action:
          "size-11 rounded-full bg-foreground text-background ring-0 hover:opacity-90",
      },
    },
    {
      variant: "soft",
      actionType: "button",
      class: {
        action:
          "h-11 rounded-2xl bg-foreground px-5 text-background hover:opacity-90",
      },
    },
  ],
  defaultVariants: {
    variant: "primary",
    actionType: "plus",
  },
});

export type CallToActionCardVariantProps = VariantProps<
  typeof callToActionCardVariants
>;
