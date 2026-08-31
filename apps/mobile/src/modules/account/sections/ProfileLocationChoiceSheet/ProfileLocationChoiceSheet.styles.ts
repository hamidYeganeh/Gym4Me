import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const profileLocationChoiceSheetVariants = tv({
  slots: {
    body: "flex flex-col gap-3 overflow-hidden pb-2",
    wheel: [
      "mx-auto flex max-h-72 w-full max-w-sm flex-col gap-1 overflow-y-auto",
      "overscroll-contain py-1 [-webkit-overflow-scrolling:touch]",
    ].join(" "),
    wheelItem: [
      "flex h-auto min-h-0 w-full items-center justify-center",
      "rounded-2xl px-4 py-3 text-center text-base font-medium text-muted",
      "outline-none transition-colors",
      "data-[selected=true]:bg-accent/10 data-[selected=true]:font-semibold",
      "data-[selected=true]:text-accent data-[selected=true]:ring-1",
      "data-[selected=true]:ring-accent",
    ].join(" "),
    empty: "text-center text-sm text-muted",
  },
});

export type ProfileLocationChoiceSheetVariants = VariantProps<
  typeof profileLocationChoiceSheetVariants
>;
