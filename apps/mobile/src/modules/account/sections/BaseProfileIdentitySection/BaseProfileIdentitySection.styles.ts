import { tv } from "tailwind-variants";

export const baseProfileIdentitySectionVariants = tv({
  slots: {
    identity: "flex flex-col items-center gap-1.5 px-1 pt-3 text-center",
    memberChip: [
      "border border-accent bg-transparent text-accent",
      "[&_.chip__label]:text-xs [&_.chip__label]:font-semibold",
      "[&_.chip__label]:tracking-wide [&_.chip__label]:lowercase",
    ].join(" "),
    memberSince: "text-muted",
    name: "mt-0.5 tracking-tight text-foreground",
  },
});
