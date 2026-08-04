import { tv } from "tailwind-variants";

export const rolePlaceholderScreenVariants = tv({
  slots: {
    root: "flex min-h-dvh flex-col items-center justify-center gap-3 px-screen text-center",
    title: "text-2xl font-semibold text-foreground",
    body: "max-w-sm text-base text-muted",
  },
});
