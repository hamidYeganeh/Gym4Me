import { tv } from "tailwind-variants";

export const supportTicketsScreenVariants = tv({
  slots: {
    content: "mx-auto flex w-full max-w-[1500px] flex-col gap-5",
    intro: "flex flex-col gap-2",
    title:
      "text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[2rem]",
    subtitle: "max-w-2xl text-sm leading-7 text-muted sm:text-base",
    actions: "flex flex-wrap gap-2",
    drawerBody: "flex flex-col gap-4",
    meta: "grid gap-3 text-sm",
    thread: "flex max-h-80 flex-col gap-3 overflow-y-auto rounded-xl bg-surface-secondary p-3",
    message: "flex flex-col gap-1 rounded-lg p-3",
    messageRequester: "bg-surface self-start",
    messageAdmin: "bg-accent/10 self-end",
    messageMeta: "text-xs text-muted",
    replyField: "flex flex-col gap-2",
    resolveField: "mt-3 flex flex-col gap-2",
  },
});
