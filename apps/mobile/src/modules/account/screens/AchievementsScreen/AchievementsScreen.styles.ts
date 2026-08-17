import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const achievementsScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-7 pb-12 pt-2",
    intro: "flex flex-col gap-1",
    introTitle: "text-balance tracking-tight text-foreground",
    introSubtitle: "max-w-[21rem] text-pretty leading-relaxed text-muted",
    state: "py-16 text-center text-muted",
  },
});

export type AchievementsScreenVariants = VariantProps<
  typeof achievementsScreenVariants
>;
