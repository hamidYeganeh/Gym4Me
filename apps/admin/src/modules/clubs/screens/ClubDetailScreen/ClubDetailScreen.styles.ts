import { tv } from "tailwind-variants";

export const clubDetailScreenVariants = tv({
  slots: {
    content: "mx-auto flex w-full max-w-[960px] flex-col gap-6",
    error: "text-sm text-danger",
  },
});
