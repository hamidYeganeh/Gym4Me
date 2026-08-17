import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

/**
 * Shared OTP slot chrome — empty / filled / error must not resize.
 * Sizes map to `--otp-slot-*` tokens in `@repo/theme/heroui.css`.
 */
const slotChrome = [
  "relative flex !grow-0 !shrink-0 !flex-none items-center justify-center",
  "!box-border !border-0 !p-0",
  "overflow-hidden outline-none !shadow-none",
  "leading-none font-bold tabular-nums",
  // Empty
  "!ring-2 !ring-surface !bg-background !text-muted",
  "hover:!bg-background hover:!ring-surface",
  "data-[hovered=true]:!bg-background data-[hovered=true]:!ring-surface",
  "data-[active=true]:!bg-background data-[active=true]:!ring-surface data-[active=true]:!shadow-none",
  // Filled
  "data-[filled=true]:!ring-accent/30 data-[filled=true]:!bg-accent data-[filled=true]:!text-accent-foreground",
  "data-[filled=true]:hover:!bg-accent data-[filled=true]:hover:!ring-accent/30",
  "data-[filled=true]:data-[hovered=true]:!bg-accent data-[filled=true]:data-[hovered=true]:!ring-accent/30",
  "data-[filled=true]:data-[active=true]:!bg-accent data-[filled=true]:data-[active=true]:!ring-accent/30",
  // Error
  "data-[invalid=true]:!ring-danger/60 data-[invalid=true]:!bg-danger data-[invalid=true]:!text-danger-foreground",
  "data-[invalid=true]:hover:!bg-danger data-[invalid=true]:hover:!ring-danger/60",
  "data-[invalid=true]:data-[hovered=true]:!bg-danger data-[invalid=true]:data-[hovered=true]:!ring-danger/60",
  "data-[invalid=true]:data-[active=true]:!bg-danger data-[invalid=true]:data-[active=true]:!ring-danger/60",
  "data-[invalid=true]:data-[filled=true]:!bg-danger data-[invalid=true]:data-[filled=true]:!text-danger-foreground data-[invalid=true]:data-[filled=true]:!ring-danger/60",
  // Caret + value stay out of flow so they never change the box
  "[&_[data-slot=input-otp-caret]]:absolute [&_[data-slot=input-otp-caret]]:h-8 [&_[data-slot=input-otp-caret]]:w-0.5",
  "[&_[data-slot=input-otp-caret]]:bg-muted",
  "data-[filled=true]:[&_[data-slot=input-otp-caret]]:bg-accent-foreground",
  "data-[invalid=true]:[&_[data-slot=input-otp-caret]]:bg-danger-foreground",
  "[&_[data-slot=input-otp-slot-value]]:absolute",
  "[&_[data-slot=input-otp-slot-value]]:leading-none",
  "[&_[data-slot=input-otp-slot-value]]:font-bold",
  "[&_[data-slot=input-otp-slot-value]]:tracking-tight",
].join(" ");

export const inputOTPVariants = tv({
  slots: {
    root: "w-auto",
    group: "flex items-center justify-center [direction:ltr]",
    slot: slotChrome,
  },
  variants: {
    size: {
      /** Gallery / showcase — 4-digit display slots */
      lg: {
        root: "gap-[var(--otp-slot-lg-gap)]",
        group: "gap-[var(--otp-slot-lg-gap)]",
        slot: [
          "!h-[var(--otp-slot-lg-height)] !w-[var(--otp-slot-lg-width)]",
          "!rounded-[var(--otp-slot-lg-radius)]",
          "!text-[length:var(--otp-slot-lg-font)]",
          "[&_[data-slot=input-otp-slot-value]]:!text-[length:var(--otp-slot-lg-font)]",
        ].join(" "),
      },
      /** Auth — 6 digits on 375 frame (screen − 2×margin) */
      md: {
        root: "w-full max-w-full gap-[var(--otp-slot-md-gap)]",
        group: "w-full gap-[var(--otp-slot-md-gap)]",
        slot: [
          "!h-[var(--otp-slot-md-height)] !w-[var(--otp-slot-md-width)]",
          "!rounded-[var(--otp-slot-md-radius)]",
          "!text-[length:var(--otp-slot-md-font)]",
          "[&_[data-slot=input-otp-slot-value]]:!text-[length:var(--otp-slot-md-font)]",
          "[&_[data-slot=input-otp-caret]]:h-6",
        ].join(" "),
      },
    },
  },
  defaultVariants: {
    size: "lg",
  },
});

export type InputOTPVariantProps = VariantProps<typeof inputOTPVariants>;
