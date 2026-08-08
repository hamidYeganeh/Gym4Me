import { tv } from "tailwind-variants";

export const adminFormDrawerVariants = tv({
  slots: {
    dialog: "w-full max-w-lg border-s border-border bg-background sm:max-w-xl",
    body: "flex flex-col gap-4",
  },
});
