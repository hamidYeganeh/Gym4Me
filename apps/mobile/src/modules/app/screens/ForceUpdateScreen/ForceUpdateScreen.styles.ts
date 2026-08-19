import { tv } from "tailwind-variants";

export const forceUpdateScreenVariants = tv({
  slots: {
    root: "flex min-h-screen flex-col items-center justify-center bg-background px-6",
    content: "flex max-w-md flex-col items-center gap-6 text-center",
    title: "tracking-tight text-foreground",
    body: "text-muted",
    features: "w-full list-disc space-y-2 pe-1 ps-5 text-start text-sm text-foreground",
    versions: "flex flex-col gap-1 text-sm text-muted",
    actions: "flex w-full flex-col gap-3 pt-2",
  },
});
