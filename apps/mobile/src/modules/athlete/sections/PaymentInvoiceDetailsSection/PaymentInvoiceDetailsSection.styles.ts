import { tv } from "tailwind-variants";

export const paymentInvoiceDetailsSectionVariants = tv({
  slots: {
    intro: "flex flex-col gap-2",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    section: "flex flex-col gap-2",
    sectionTitle: "px-1 text-muted",
    invoiceCard: "overflow-hidden rounded-[24px] border-0 bg-surface",
    invoiceRow: "flex items-center justify-between gap-3 px-4 py-3.5",
    invoiceLabel: "text-muted",
    invoiceValue: "text-end text-foreground",
    invoiceDiscount: "text-end text-success",
    divider: "mx-4 h-px bg-border",
    totalRow: "flex items-center justify-between gap-3 bg-default px-4 py-4",
    totalLabel: "text-foreground",
    totalValue: "text-foreground",
  },
});
