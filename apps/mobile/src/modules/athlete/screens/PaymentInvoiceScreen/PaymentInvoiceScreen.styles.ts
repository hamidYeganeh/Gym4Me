export const paymentInvoiceScreenStyles = {
  root: "bg-background",
  content: "flex flex-col gap-6 pb-10 pt-1",
  intro: "flex flex-col gap-2",
  introTitle: "tracking-tight text-foreground",
  introSubtitle: "text-muted",
  sectionTitle: "px-1 text-muted",
  section: "flex flex-col gap-2",
  invoiceCard:
    "overflow-hidden rounded-[24px] border border-border bg-surface",
  invoiceRow: "flex items-center justify-between gap-3 px-4 py-3.5",
  invoiceLabel: "text-muted",
  invoiceValue: "text-foreground text-end",
  invoiceDiscount: "text-success text-end",
  divider: "mx-4 h-px bg-border",
  totalRow:
    "flex items-center justify-between gap-3 bg-default px-4 py-4",
  totalLabel: "text-foreground",
  totalValue: "text-foreground",
  methods: "flex flex-col gap-3",
  methodCard:
    "h-auto w-full items-center gap-3 rounded-[24px] border border-border bg-surface p-4 text-start font-normal",
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
  empty:
    "flex flex-col items-center gap-2 rounded-[24px] border border-border bg-surface px-6 py-10 text-center",
  emptyTitle: "text-foreground",
} as const;
