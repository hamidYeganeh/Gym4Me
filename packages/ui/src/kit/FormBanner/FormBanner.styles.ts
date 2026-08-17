import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const formBannerVariants = tv({
  slots: {
    root: "flex items-start justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-semibold",
    message: "min-w-0 flex-1 text-start",
    dismiss:
      "shrink-0 outline-none data-[hovered=true]:bg-transparent data-[pressed=true]:opacity-70",
  },
  variants: {
    tone: {
      danger: {
        root: "border border-danger/40 bg-danger/15 text-danger",
        dismiss: "text-danger data-[hovered=true]:bg-danger/10",
      },
      success: {
        root: "border border-success/40 bg-success/15 text-success",
        dismiss: "text-success data-[hovered=true]:bg-success/10",
      },
      warning: {
        root: "border border-warning/25 bg-warning/10 text-warning",
        dismiss: "text-warning data-[hovered=true]:bg-warning/10",
      },
      muted: {
        root: "border border-border/60 bg-surface-secondary text-muted",
        dismiss: "text-muted data-[hovered=true]:bg-default",
      },
    },
  },
  defaultVariants: {
    tone: "danger",
  },
});

export type FormBannerVariantProps = VariantProps<typeof formBannerVariants>;
