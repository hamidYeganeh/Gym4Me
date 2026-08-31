import { tv } from "tailwind-variants";

export const popularLocationCardVariants = tv({
  slots: {
    root: [
      "relative flex w-full min-w-0 items-center gap-3 rounded-[20px]",
      "bg-transparent text-start text-foreground",
    ].join(" "),
    media: "relative size-[4.5rem] shrink-0 overflow-hidden rounded-[20px] bg-surface-tertiary",
    image:
      "pointer-events-none absolute inset-0 size-full object-cover select-none",
    body: "flex min-w-0 flex-1 flex-col gap-0.5",
    eyebrow: "truncate text-muted",
    name: "truncate leading-tight tracking-tight text-foreground",
    count: "truncate text-muted",
    pressTarget: "absolute inset-0 z-10 h-auto min-h-0 rounded-[20px] p-0",
  },
  variants: {
    pressable: {
      true: {
        root: "cursor-pointer transition-transform duration-fast ease-app active:scale-[0.98]",
      },
      false: {},
    },
  },
  defaultVariants: {
    pressable: false,
  },
});
