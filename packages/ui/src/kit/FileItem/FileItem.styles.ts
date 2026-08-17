import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const fileItemVariants = tv({
  slots: {
    root: [
      "flex w-full items-center gap-3 rounded-[24px] border-0",
      "bg-surface p-4 text-start",
    ].join(" "),
    iconWrap:
      "flex size-12 shrink-0 items-center justify-center rounded-[1rem]",
    icon: "size-6",
    typeIcon: "shrink-0 self-start",
    body: "flex min-w-0 flex-1 flex-col gap-2",
    header: "flex items-center justify-between gap-2",
    fileName: "min-w-0 truncate text-muted",
    trailing: "shrink-0",
    trailingIcon: "size-5",
    successBadge:
      "flex size-5 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground",
    successBadgeIcon: "size-3",
    progress: "w-full gap-0",
    track: "h-2 w-full overflow-hidden rounded-full bg-default",
    fill: "h-full rounded-full",
    footer: "flex items-center justify-between gap-2",
    meta: "min-w-0 truncate text-muted",
    percent: "shrink-0 tabular-nums text-muted",
    removeButton:
      "size-8 min-w-8 rounded-full text-muted shadow-none data-[pressed=true]:scale-[0.97]",
    retryButton:
      "h-auto min-h-0 gap-1.5 px-0 py-0 text-accent shadow-none data-[pressed=true]:opacity-80",
    retryIcon: "size-4 shrink-0",
  },
  variants: {
    status: {
      uploading: {
        fill: "bg-accent",
      },
      success: {
        iconWrap: "bg-success/15 text-success",
        fill: "bg-success",
      },
      error: {
        iconWrap: "bg-danger/15 text-danger",
        fill: "bg-danger",
        removeButton: "text-danger",
      },
    },
  },
  defaultVariants: {
    status: "uploading",
  },
});

export type FileItemVariantProps = VariantProps<typeof fileItemVariants>;
