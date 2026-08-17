import { tv } from "tailwind-variants";

export const supportTicketsDetailDrawerSectionVariants = tv({
  slots: {
    drawerBody: "flex flex-col gap-4",
    meta: "grid gap-3 text-sm",
    thread:
      "flex max-h-80 flex-col gap-3 overflow-y-auto rounded-xl bg-surface-secondary p-3",
    message: "flex flex-col gap-1 rounded-lg p-3",
    messageRequester: "bg-surface self-start",
    messageAdmin: "bg-accent/10 self-end",
    messageMeta: "text-xs text-muted",
    replyField: "flex flex-col gap-2",
    actions: "flex flex-wrap gap-2",
  },
});
