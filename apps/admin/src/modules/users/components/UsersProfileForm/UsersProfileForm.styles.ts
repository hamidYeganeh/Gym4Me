import { tv } from "tailwind-variants";

export const usersProfileFormVariants = tv({
  slots: {
    form: "flex flex-col gap-5",
    formRow: "grid gap-4 sm:grid-cols-2",
    fieldIcon: "text-muted",
    formError: "text-sm text-danger",
    avatarBlock: "flex flex-col gap-3",
    avatarLabel: "text-sm font-medium text-foreground",
    avatarRow: "flex flex-col gap-4 sm:flex-row sm:items-center",
    avatarPreview: "size-14 shrink-0 border-2 border-surface shadow-sm",
    avatarFallback: "text-sm font-semibold",
    dropzone:
      "flex min-h-[120px] flex-1 cursor-default flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface-secondary/60 px-4 py-5 text-center",
    dropIcon: "text-warning",
    dropTitle: "text-sm text-muted",
    dropHighlight: "font-semibold text-warning",
    dropHint: "text-xs text-muted",
  },
});
