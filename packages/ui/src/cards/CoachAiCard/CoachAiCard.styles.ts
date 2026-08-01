import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const coachAiCardVariants = tv({
  slots: {
    root: [
      "flex w-full flex-col items-center gap-5 rounded-[28px] px-6 py-7 text-center",
      "bg-warning text-white",
    ].join(" "),
    title: "max-w-[18rem] text-[17px] leading-snug tracking-tight text-white",
    action: [
      "inline-flex h-11 items-center gap-2 rounded-xl px-5",
      "bg-white text-warning shadow-none",
      "hover:opacity-90 data-[hovered=true]:opacity-90",
      "data-[pressed=true]:scale-[0.98]",
      "[--button-bg:white] [--button-fg:var(--warning)]",
      "[--button-bg-hover:white] [--button-bg-pressed:white]",
    ].join(" "),
    actionIcon: "size-4 shrink-0 text-current",
  },
});

export type CoachAiCardVariantProps = VariantProps<typeof coachAiCardVariants>;
