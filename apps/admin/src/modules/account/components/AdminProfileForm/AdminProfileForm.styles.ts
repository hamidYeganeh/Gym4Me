import { tv } from "tailwind-variants";

export const adminProfileFormVariants = tv({
  slots: {
    form: "flex flex-col gap-6",
    row: "grid gap-4 sm:grid-cols-2",
    avatarBlock: "flex flex-col gap-3",
    avatarPreview: "size-20",
    phone: "flex flex-col gap-1",
    error: "text-danger",
  },
});
