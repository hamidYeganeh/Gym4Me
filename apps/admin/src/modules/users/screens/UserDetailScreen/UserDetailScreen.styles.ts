import { tv } from "tailwind-variants";

export const userDetailScreenVariants = tv({
  slots: {
    content: "mx-auto flex w-full max-w-[1100px] flex-col gap-8",
    sections: "flex flex-col gap-8",
    message: "text-sm text-success",
    error: "text-sm text-danger",
    loading: "flex items-center justify-center gap-3 py-24 text-sm text-muted",
  },
});
