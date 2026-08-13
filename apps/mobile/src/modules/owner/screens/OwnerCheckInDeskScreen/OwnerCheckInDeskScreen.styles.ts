import { tv } from "tailwind-variants";

export const ownerCheckInDeskScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-10 pt-1",
    intro: "flex flex-col gap-2",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    form: "flex flex-col gap-4 rounded-[24px] border border-border bg-surface p-4",
    feedback: "text-center",
    success: "text-success",
    danger: "text-danger",
  },
});
