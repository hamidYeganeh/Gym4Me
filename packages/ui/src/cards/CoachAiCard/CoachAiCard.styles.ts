import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const coachAiCardVariants = tv({
  slots: {
    root: [
      "flex w-full flex-col items-center gap-5 rounded-[28px] px-6 py-7 text-center",
      "bg-accent text-accent-foreground",
    ].join(" "),
    title:
      "max-w-[18rem] text-[17px] leading-snug tracking-tight text-accent-foreground",
    action: [
      "inline-flex h-11 items-center gap-2 rounded-xl px-5",
      "bg-accent-foreground text-accent shadow-none",
      "hover:opacity-90 data-[hovered=true]:opacity-90",
      "data-[pressed=true]:scale-[0.98]",
      "[--button-bg:var(--accent-foreground)] [--button-fg:var(--accent)]",
      "[--button-bg-hover:var(--accent-foreground)]",
      "[--button-bg-pressed:var(--accent-foreground)]",
    ].join(" "),
    actionIcon: "size-4 shrink-0 text-current",
  },
});

export type CoachAiCardVariantProps = VariantProps<typeof coachAiCardVariants>;
