import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const toastVariants = tv({
  slots: {
    root: "items-center gap-3 px-4 py-2 text-start text-[var(--toast-foreground)] shadow-[0_10px_28px_rgba(15,15,15,0.18)]",
    indicator:
      "shrink-0 p-0 text-[var(--toast-foreground)] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5",
    content: "min-w-0 flex-1 items-start gap-0 self-center text-start",
    title:
      "text-start text-sm font-semibold leading-5 text-[var(--toast-foreground)]",
    description:
      "text-start text-sm font-normal leading-5 text-[var(--toast-foreground)]/90",
    close:
      "pointer-events-auto static inset-auto size-8 shrink-0 self-center border-0 bg-transparent text-[var(--toast-foreground)] opacity-100 shadow-none data-[hovered=true]:bg-transparent data-[hovered=true]:opacity-80 [&_[data-slot='close-button-icon']]:size-4",
  },
  variants: {
    variant: {
      default: { root: "bg-[var(--toast-default)]" },
      accent: { root: "bg-[var(--toast-accent)]" },
      success: { root: "bg-[var(--toast-success)]" },
      warning: { root: "bg-[var(--toast-warning)]" },
      danger: { root: "bg-[var(--toast-danger)]" },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type ToastVariantProps = VariantProps<typeof toastVariants>;
