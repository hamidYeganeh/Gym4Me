export type OwnerInvoiceStatus = "draft" | "issued" | "paid" | "void";

export type OwnerInvoice = {
  id: string;
  number: string;
  amountLabel: string;
  status: OwnerInvoiceStatus;
  issuedAtLabel: string;
  customerLabel: string;
};

export const OWNER_INVOICES: OwnerInvoice[] = [
  {
    id: "inv-1",
    number: "INV-1403-0524-001",
    amountLabel: "۴٬۵۰۰٬۰۰۰ تومان",
    status: "paid",
    issuedAtLabel: "۱۴۰۳/۰۵/۲۴",
    customerLabel: "رضا نوری",
  },
  {
    id: "inv-2",
    number: "INV-1403-0523-018",
    amountLabel: "۱٬۲۰۰٬۰۰۰ تومان",
    status: "issued",
    issuedAtLabel: "۱۴۰۳/۰۵/۲۳",
    customerLabel: "مریم حسینی",
  },
  {
    id: "inv-3",
    number: "INV-1403-0522-007",
    amountLabel: "۸۵۰٬۰۰۰ تومان",
    status: "draft",
    issuedAtLabel: "۱۴۰۳/۰۵/۲۲",
    customerLabel: "امیر کاظمی",
  },
  {
    id: "inv-4",
    number: "INV-1403-0510-003",
    amountLabel: "۲٬۱۰۰٬۰۰۰ تومان",
    status: "void",
    issuedAtLabel: "۱۴۰۳/۰۵/۱۰",
    customerLabel: "نیلوفر جعفری",
  },
];
