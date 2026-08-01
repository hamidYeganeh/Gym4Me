import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

/** Fixed slot box: 24px×2 + ~40px digit → 88×104 (matches py-8 / px-6 intent). */
const SLOT_SIZE = "!h-[104px] !w-[88px]";

export const inputOTPVariants = tv({
  slots: {
    root: "w-auto gap-3",
    group: "gap-3",
    slot: [
      // Static size — empty / filled / error must not resize
      "relative flex !grow-0 !shrink-0 !flex-none items-center justify-center",
      SLOT_SIZE,
      "!box-border !rounded-[32px] !border-0 !p-0",
      "overflow-hidden outline-none !shadow-none",
      "!text-[40px] leading-none font-bold tabular-nums",
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
      "[&_[data-slot=input-otp-slot-value]]:!text-[40px]",
      "[&_[data-slot=input-otp-slot-value]]:leading-none",
      "[&_[data-slot=input-otp-slot-value]]:font-bold",
      "[&_[data-slot=input-otp-slot-value]]:tracking-tight",
    ].join(" "),
  },
});

export type InputOTPVariantProps = VariantProps<typeof inputOTPVariants>;
