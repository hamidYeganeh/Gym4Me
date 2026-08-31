import { tv } from "tailwind-variants";

export const athleteBookingDetailActionsSectionVariants = tv({
  slots: {
    actions: "flex flex-col gap-3",
    cancelConfirm: "flex flex-col gap-3 -[24px] border border-danger/30 bg-danger/10",
    cancelConfirmTitle: "text-foreground",
    cancelConfirmBody: "text-muted",
    cancelConfirmActions: "flex gap-3",
    cancelReasons: "flex flex-col gap-2",
    cancelReason:
      "flex w-full items-center gap-3 rounded-[1.25rem] border-0 bg-surface px-4 py-3 text-start transition-colors",
    cancelReasonSelected: "border-danger bg-danger/5",
    cancelReasonRadio:
      "flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-border",
    cancelReasonRadioSelected: "border-danger",
    cancelReasonDot: "size-2.5 rounded-full bg-danger",
    cancelReasonLabel: "text-foreground",
    errorText: "text-danger",
    cancelledNotice:
      "rounded-[24px] border-0 bg-surface px-5 py-4 text-center",
    cancelledNoticeText: "text-muted",
  },
});
