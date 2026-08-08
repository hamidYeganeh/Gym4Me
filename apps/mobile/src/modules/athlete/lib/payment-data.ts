export type InvoiceItem = {
  label: string;
  amountLabel: string;
};

export type Invoice = {
  id: string;
  title: string;
  clubName: string;
  items: InvoiceItem[];
  discountLabel?: string;
  taxLabel: string;
  totalLabel: string;
  payable: number;
};

export const INVOICES: Invoice[] = [
  {
    id: "inv-demo",
    title: "رزرو سانس بدنسازی",
    clubName: "باشگاه انرژی",
    items: [
      { label: "سانس بدنسازی — تک‌جلسه", amountLabel: "۴۵۰٬۰۰۰ تومان" },
      { label: "خدمات جانبی (کمد و حوله)", amountLabel: "۵۰٬۰۰۰ تومان" },
    ],
    discountLabel: "۵۰٬۰۰۰ تومان",
    taxLabel: "۴۵٬۰۰۰ تومان",
    totalLabel: "۴۹۵٬۰۰۰ تومان",
    payable: 495000,
  },
  {
    id: "inv-1001",
    title: "جلسه بدنسازی اختصاصی",
    clubName: "باشگاه انرژی",
    items: [{ label: "جلسه اختصاصی با مربی", amountLabel: "۴۵۰٬۰۰۰ تومان" }],
    taxLabel: "۴۰٬۵۰۰ تومان",
    totalLabel: "۴۹۰٬۵۰۰ تومان",
    payable: 490500,
  },
  {
    id: "inv-1002",
    title: "کلاس کراس‌فیت گروهی",
    clubName: "باشگاه آترین",
    items: [{ label: "کلاس گروهی — تک‌جلسه", amountLabel: "۲۲۰٬۰۰۰ تومان" }],
    discountLabel: "۲۰٬۰۰۰ تومان",
    taxLabel: "۱۸٬۰۰۰ تومان",
    totalLabel: "۲۱۸٬۰۰۰ تومان",
    payable: 218000,
  },
  {
    id: "inv-1003",
    title: "مشاوره برنامه تمرینی",
    clubName: "باشگاه انرژی",
    items: [{ label: "مشاوره ۴۵ دقیقه‌ای", amountLabel: "۳۰۰٬۰۰۰ تومان" }],
    taxLabel: "۲۷٬۰۰۰ تومان",
    totalLabel: "۳۲۷٬۰۰۰ تومان",
    payable: 327000,
  },
  {
    id: "inv-1004",
    title: "کلاس یوگا صبحگاهی",
    clubName: "باشگاه آرامش",
    items: [{ label: "کلاس یوگا — تک‌جلسه", amountLabel: "۱۸۰٬۰۰۰ تومان" }],
    taxLabel: "۱۶٬۲۰۰ تومان",
    totalLabel: "۱۹۶٬۲۰۰ تومان",
    payable: 196200,
  },
  {
    id: "inv-1005",
    title: "رزرو سالن اسکواش",
    clubName: "مجموعه المپیک",
    items: [{ label: "اجاره سالن — یک ساعت", amountLabel: "۳۵۰٬۰۰۰ تومان" }],
    taxLabel: "۳۱٬۵۰۰ تومان",
    totalLabel: "۳۸۱٬۵۰۰ تومان",
    payable: 381500,
  },
  {
    id: "inv-1006",
    title: "جلسه تمرین فانکشنال",
    clubName: "باشگاه آترین",
    items: [{ label: "جلسه فانکشنال", amountLabel: "۴۰۰٬۰۰۰ تومان" }],
    taxLabel: "۳۶٬۰۰۰ تومان",
    totalLabel: "۴۳۶٬۰۰۰ تومان",
    payable: 436000,
  },
  {
    id: "inv-1007",
    title: "کلاس اسپینینگ",
    clubName: "باشگاه انرژی",
    items: [{ label: "کلاس اسپینینگ — تک‌جلسه", amountLabel: "۲۵۰٬۰۰۰ تومان" }],
    taxLabel: "۲۲٬۵۰۰ تومان",
    totalLabel: "۲۷۲٬۵۰۰ تومان",
    payable: 272500,
  },
  {
    id: "inv-1008",
    title: "جلسه شنا آموزشی",
    clubName: "مجموعه المپیک",
    items: [{ label: "جلسه شنا با مربی", amountLabel: "۵۰۰٬۰۰۰ تومان" }],
    taxLabel: "۴۵٬۰۰۰ تومان",
    totalLabel: "۵۴۵٬۰۰۰ تومان",
    payable: 545000,
  },
];

export const WALLET_BALANCE_LABEL = "۲٬۴۵۰٬۰۰۰ تومان";

export function getInvoice(invoiceId: string): Invoice | undefined {
  return INVOICES.find((invoice) => invoice.id === invoiceId);
}

export function getAllInvoiceIds(): string[] {
  return INVOICES.map((invoice) => invoice.id);
}
