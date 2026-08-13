import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const clubBranchCardVariants = tv({
  slots: {
    root: [
      "relative flex flex-col justify-end overflow-hidden",
      "bg-surface-tertiary text-foreground",
      "shadow-[0_14px_34px_color-mix(in_oklch,var(--foreground)_10%,transparent)]",
    ].join(" "),
    media: "absolute inset-0 overflow-hidden",
    image:
      "pointer-events-none absolute inset-0 size-full object-cover select-none",
    scrim: [
      "pointer-events-none absolute inset-0",
      "bg-linear-to-t from-background to-transparent",
    ].join(" "),
    body: "relative z-10 flex flex-col items-start",
    labels: [
      "flex max-w-none items-end gap-1.5",
      "[writing-mode:vertical-rl]",
      "rotate-180",
      "text-foreground",
    ].join(" "),
    title: "leading-none tracking-tight text-foreground",
    subtitle: "leading-none tracking-tight text-foreground/90",
    action: [
      "shrink-0 rounded-full border border-foreground",
      "bg-transparent text-foreground",
      "hover:bg-foreground/10 data-[hovered=true]:bg-foreground/10",
      "pressed:bg-foreground/15 data-[pressed=true]:bg-foreground/15",
      "[--button-bg:transparent]",
      "[--button-bg-hover:color-mix(in_oklch,var(--foreground)_10%,transparent)]",
      "[--button-bg-pressed:color-mix(in_oklch,var(--foreground)_15%,transparent)]",
      "[--button-fg:var(--foreground)]",
    ].join(" "),
  },
  variants: {
    size: {
      sm: {
        root: "h-[280px] w-[160px] rounded-[28px] p-4",
        body: "gap-3",
        labels: "gap-1",
        title: "text-lg font-bold",
        subtitle: "text-sm font-normal",
        action: "size-9 [&_svg]:!size-3.5",
      },
      md: {
        root: "h-[360px] w-[200px] rounded-[36px] p-5",
        body: "gap-4",
        labels: "gap-1.5",
        title: "text-2xl font-bold",
        subtitle: "text-base font-normal",
        action: "size-11 [&_svg]:!size-4",
      },
      lg: {
        root: "h-[440px] w-[240px] rounded-[40px] p-6",
        body: "gap-5",
        labels: "gap-2",
        title: "text-[28px] font-bold",
        subtitle: "text-lg font-normal",
        action: "size-12 [&_svg]:!size-[18px]",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type ClubBranchCardVariantProps = VariantProps<
  typeof clubBranchCardVariants
>;
