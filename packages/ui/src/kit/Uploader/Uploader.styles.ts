import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const uploaderVariants = tv({
  slots: {
    root: [
      "flex w-full cursor-pointer flex-col items-center justify-center gap-4",
      "rounded-[32px] border-2 border-dashed border-accent bg-surface p-4",
      "transition-colors duration-fast ease-app outline-none",
      "focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2",
    ],
    content: "flex w-full flex-col items-center gap-1 text-center",
    title: "text-accent",
    description: "text-muted",
    button:
      "rounded-full bg-accent px-5 hover:opacity-90 data-[pressed=true]:scale-[0.98]",
    buttonIcon: "size-5 shrink-0",
  },
  variants: {
    isDragActive: {
      true: {
        root: "border-solid bg-accent/5",
      },
    },
    isDragReject: {
      true: {
        root: "border-danger bg-danger/5",
      },
    },
    isDisabled: {
      true: {
        root: "cursor-not-allowed opacity-50",
      },
    },
  },
  defaultVariants: {
    isDragActive: false,
    isDragReject: false,
    isDisabled: false,
  },
});

export type UploaderVariantProps = VariantProps<typeof uploaderVariants>;
