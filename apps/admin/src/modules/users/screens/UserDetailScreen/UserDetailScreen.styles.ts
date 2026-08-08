import { tv } from "tailwind-variants";

export const userDetailScreenVariants = tv({
  slots: {
    content: "mx-auto flex w-full max-w-[1100px] flex-col gap-5",
    grid: "grid gap-5 lg:grid-cols-2",
    message: "text-sm text-success",
    error: "text-sm text-danger",
    loading: "flex items-center justify-center gap-3 py-24 text-sm text-muted",
  },
});
