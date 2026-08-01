export const athleteMetricsReorderScreenStyles = {
  root: "bg-background",
  content: "flex flex-col gap-6 pb-4 pt-1",
  footer:
    "border-t border-border bg-background px-screen py-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
  saveButton:
    "h-14 w-full rounded-2xl bg-warning text-base font-semibold text-warning-foreground data-[hovered=true]:bg-warning/90",
} as const;
