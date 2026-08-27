import { tv } from "tailwind-variants";

export const baseProfileIdentitySectionVariants = tv({
  slots: {
    identity: "flex flex-col items-center gap-1.5 px-1 pt-3 text-center",
    memberChip: [].join(" "),
    memberSince: "text-muted",
    name: "mt-0.5 tracking-tight text-foreground",
  },
});
