import { tv } from "tailwind-variants";

export const ownerMembersSellSectionVariants = tv({
  slots: {
    root: "overflow-hidden rounded-[24px] border-0 bg-surface",
    body: "flex flex-col gap-3 p-4",
    select:
      "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm",
    tenderGrid: "grid grid-cols-3 gap-2",
    debtGrid: "grid grid-cols-2 gap-2",
  },
});
