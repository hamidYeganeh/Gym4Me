import { tv } from "tailwind-variants";

export const optionalUpdateBannerVariants = tv({
  slots: {
    root: "border-b border-warning/30 bg-warning/10 px-4 py-3 text-foreground",
    inner: "mx-auto flex w-full max-w-3xl flex-col gap-2",
    header: "flex items-start justify-between gap-3",
    title: "text-sm font-semibold",
    body: "text-sm text-muted",
    features: "list-disc space-y-1 pe-1 ps-5 text-sm",
    actions: "flex flex-wrap items-center gap-2 pt-1",
  },
});
