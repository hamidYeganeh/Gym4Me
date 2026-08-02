import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const coachExpertCardVariants = tv({
  slots: {
    root: [
      "flex h-auto w-full flex-col items-center gap-2.5 rounded-2xl bg-transparent p-1",
      "shadow-none",
      "hover:bg-transparent data-[hovered=true]:bg-transparent",
      "data-[pressed=true]:scale-[0.98]",
      "[--button-bg:transparent] [--button-bg-hover:transparent] [--button-bg-pressed:transparent]",
    ].join(" "),
    avatar: "size-[88px]",
    badge: [
      "border-2 border-background",
      "[--badge-bg:var(--success)] [--badge-fg:var(--success-foreground)]",
    ].join(" "),
    badgeIcon: "size-3 text-success-foreground",
    title:
      "max-w-full text-center text-sm font-medium leading-snug tracking-tight text-foreground",
  },
});

export type CoachExpertCardVariantProps = VariantProps<
  typeof coachExpertCardVariants
>;
