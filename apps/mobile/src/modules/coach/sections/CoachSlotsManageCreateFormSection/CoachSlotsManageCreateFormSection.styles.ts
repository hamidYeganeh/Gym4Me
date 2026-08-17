import { tv } from "tailwind-variants";

export const coachSlotsManageCreateFormSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4 rounded-[24px] border-0 bg-surface p-5",
    title: "text-foreground",
    hint: "text-muted",
    fieldLabel: "px-1 text-muted",
    fieldGroup: "flex flex-col gap-2",
    errorText: "text-danger",
  },
});
