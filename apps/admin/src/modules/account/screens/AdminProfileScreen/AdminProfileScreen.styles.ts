import { tv } from "tailwind-variants";

export const adminProfileScreenVariants = tv({
  slots: {
    content: "flex flex-col gap-6 p-6",
    loading: "flex min-h-40 items-center justify-center",
    error: "text-danger",
  },
});
