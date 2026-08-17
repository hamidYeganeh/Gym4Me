import { tv } from "tailwind-variants";

export const articleDetailScreenVariants = tv({
  slots: {
    root: "flex min-h-0 flex-1 flex-col bg-background",
    content: "flex flex-col gap-6 px-4 pb-10 pt-2",
    actionActive: "text-warning",
    loading: "py-20 text-center text-muted",
    error: "py-20 text-center text-danger",
  },
});
