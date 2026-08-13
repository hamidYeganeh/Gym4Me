import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const toastVariants = tv({
  slots: {
    icon: "shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
    close: "text-muted",
  },
});

export type ToastVariantProps = VariantProps<typeof toastVariants>;
