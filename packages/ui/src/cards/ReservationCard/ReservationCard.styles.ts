import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const reservationCardVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-3",
    card: [
      "flex h-auto w-full items-center gap-3 rounded-[1.25rem] border-0",
      "bg-surface px-3.5 py-3.5 text-start shadow-sm shadow-foreground/5",
      "transition-[border-color,background-color,box-shadow,transform] duration-fast ease-app",
      "data-[pressed=true]:scale-[0.995]",
      "[--button-bg:var(--surface)]",
      "[--button-bg-hover:color-mix(in_oklab,var(--accent)_8%,var(--surface))]",
      "[--button-bg-pressed:color-mix(in_oklab,var(--accent)_12%,var(--surface))]",
    ].join(" "),
    iconWrap: [
      "flex size-11 shrink-0 items-center justify-center rounded-[0.875rem]",
      "bg-default text-accent",
    ].join(" "),
    content: "flex min-w-0 flex-1 flex-col gap-1.5",
    topRow: "flex min-w-0 items-start justify-between gap-2",
    nameRow: "flex min-w-0 items-center gap-1.5",
    verified: "size-5 shrink-0 text-success",
    name: "min-w-0 truncate tracking-tight text-foreground",
    datetime: "shrink-0 text-xs tabular-nums text-muted",
    metaRow: "flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1",
    specialty: "inline-flex min-w-0 items-center gap-1.5 text-sm text-muted",
    specialtyIcon: "size-3.5 shrink-0 text-muted",
    metaDot: "text-sm text-muted",
    rating: "inline-flex items-center gap-1 text-sm text-muted",
    star: "size-3.5 shrink-0 text-accent",
    ratingValue: "text-muted",
    ratingCount: "text-muted",
    sessionTitle: "text-sm leading-snug text-muted",
    statusRow: "pt-0.5",
    chevron: "size-4 shrink-0 text-muted",
    actions: "grid grid-cols-2 gap-2.5",
    reschedule: [
      "h-12 rounded-[1rem] border-0 font-bold shadow-none",
      "bg-[color-mix(in_oklab,var(--accent)_12%,var(--surface))]",
      "text-accent",
      "hover:opacity-90 data-[hovered=true]:opacity-90",
      "[--button-bg:color-mix(in_oklab,var(--accent)_12%,var(--surface))]",
      "[--button-bg-hover:color-mix(in_oklab,var(--accent)_16%,var(--surface))]",
      "[--button-bg-pressed:color-mix(in_oklab,var(--accent)_18%,var(--surface))]",
    ].join(" "),
    cancel: [
      "h-12 rounded-[1rem] border-0 font-bold shadow-none",
      "bg-[color-mix(in_oklab,var(--danger)_10%,var(--surface))]",
      "text-danger",
      "hover:opacity-90 data-[hovered=true]:opacity-90",
      "[--button-bg:color-mix(in_oklab,var(--danger)_10%,var(--surface))]",
      "[--button-bg-hover:color-mix(in_oklab,var(--danger)_14%,var(--surface))]",
      "[--button-bg-pressed:color-mix(in_oklab,var(--danger)_16%,var(--surface))]",
    ].join(" "),
  },
});

export type ReservationCardVariantProps = VariantProps<
  typeof reservationCardVariants
>;
