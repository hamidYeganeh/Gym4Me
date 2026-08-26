export type OwnerDebtStatus =
  | "open"
  | "partial"
  | "settled"
  | "overdue"
  | "written-off";

export type OwnerDebtEntry = {
  id: string;
  memberName: string;
  amountLabel: string;
  remainingLabel: string;
  dueAtLabel: string;
  installmentCount: number;
  status: OwnerDebtStatus;
};

export const OWNER_DEBTS: OwnerDebtEntry[] = [
  {
    id: "debt-1",
    memberName: "رضا نوری",
    amountLabel: "۲٬۴۰۰٬۰۰۰ تومان",
    remainingLabel: "۱٬۲۰۰٬۰۰۰ تومان",
    dueAtLabel: "۱۴۰۳/۰۶/۱۵",
    installmentCount: 3,
    status: "partial",
  },
  {
    id: "debt-2",
    memberName: "مریم حسینی",
    amountLabel: "۱٬۸۰۰٬۰۰۰ تومان",
    remainingLabel: "۱٬۸۰۰٬۰۰۰ تومان",
    dueAtLabel: "۱۴۰۳/۰۵/۳۰",
    installmentCount: 2,
    status: "overdue",
  },
  {
    id: "debt-3",
    memberName: "امیر کاظمی",
    amountLabel: "۹۵۰٬۰۰۰ تومان",
    remainingLabel: "۹۵۰٬۰۰۰ تومان",
    dueAtLabel: "۱۴۰۳/۰۷/۰۱",
    installmentCount: 1,
    status: "open",
  },
  {
    id: "debt-4",
    memberName: "نیلوفر جعفری",
    amountLabel: "۳٬۶۰۰٬۰۰۰ تومان",
    remainingLabel: "۰ تومان",
    dueAtLabel: "۱۴۰۳/۰۵/۱۰",
    installmentCount: 4,
    status: "settled",
  },
];
