import { tv } from "tailwind-variants";

export const appSectionHeaderVariants = tv({
  slots: {
    root: "flex min-w-0 items-end justify-between gap-4 text-start",
    content: "flex min-w-0 flex-1 flex-col gap-1.5",
    title: "text-balance text-xl leading-tight tracking-tight text-foreground",
    description:
      "max-w-[21rem] text-pretty text-sm leading-relaxed text-muted",
    action: [
      "h-9 min-w-0 shrink-0 rounded-xl px-2.5 text-sm font-semibold text-accent",
      "shadow-none transition-opacity duration-fast ease-app",
      "hover:bg-accent/8 data-[hovered=true]:bg-accent/8",
      "data-[pressed=true]:scale-[0.98] data-[pressed=true]:opacity-80",
    ].join(" "),
  },
});
