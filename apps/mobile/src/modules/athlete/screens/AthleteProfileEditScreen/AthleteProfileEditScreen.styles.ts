import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const athleteProfileEditScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-12 pt-2",
    intro: "flex flex-col gap-2",
    title: "tracking-tight text-foreground",
    subtitle: "text-balance text-muted",
    form: "flex flex-col gap-4 rounded-[24px] border-0 bg-surface p-5",
    field: "flex w-full flex-col gap-2",
    actions: "flex flex-col gap-3 pt-1",
    error: "text-sm text-danger",
    notice: "text-sm text-success",
    privacy: "flex flex-col items-center gap-2 px-4 text-center",
    privacyIcon: "text-muted",
    privacyText: "max-w-xs text-balance text-muted",
  },
});

export type AthleteProfileEditScreenVariants = VariantProps<
  typeof athleteProfileEditScreenVariants
>;
