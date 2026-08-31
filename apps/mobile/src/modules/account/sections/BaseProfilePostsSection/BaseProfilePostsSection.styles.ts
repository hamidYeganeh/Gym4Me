import { tv } from "tailwind-variants";

export const baseProfilePostsSectionVariants = tv({
  slots: {
    root: [
      "mt-1 flex min-h-64 flex-col overflow-hidden rounded-[1.5rem]",
      "border-0 bg-surface",
    ].join(" "),
    body: "flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center",
    title: "max-w-[16rem] text-balance text-foreground",
    hint: "max-w-[18rem] text-pretty text-muted",
    footer: "border-t border-border px-4 py-3",
    createPost: "mx-auto font-semibold text-accent",
  },
});
