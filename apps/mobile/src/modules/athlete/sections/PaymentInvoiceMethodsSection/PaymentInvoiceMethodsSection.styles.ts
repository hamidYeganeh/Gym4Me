import { tv } from "tailwind-variants";

export const paymentInvoiceMethodsSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-2",
    sectionTitle: "px-1 text-muted",
    methods: "flex flex-col gap-3",
    methodCard:
      "h-auto w-full items-center gap-3 rounded-[24px] border-0 bg-surface p-4 text-start font-normal",
    methodCardSelected: "border-accent bg-accent/10",
    methodIcon:
      "flex size-11 shrink-0 items-center justify-center rounded-full bg-default text-foreground",
    methodBody: "flex min-w-0 flex-1 flex-col gap-0.5",
    methodTitle: "text-foreground",
    methodHint: "text-muted",
    methodRadio:
      "flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-border",
    methodRadioSelected: "border-accent",
    methodRadioDot: "size-2.5 rounded-full bg-accent",
  },
});
