export type OwnerCashShiftStatus = "open" | "closed";

export type OwnerCashChannel =
  | "cash"
  | "pos"
  | "card_to_card"
  | "gateway";

export type OwnerCashChannelRow = {
  channel: OwnerCashChannel;
  expectedLabel: string;
  countedLabel: string;
};

export type OwnerCashShiftData = {
  id: string;
  status: OwnerCashShiftStatus;
  openedAtLabel: string;
  openedByLabel: string;
  channels: OwnerCashChannelRow[];
  discrepancyReason?: string;
  totalExpectedLabel: string;
  totalCountedLabel: string;
};

export const OWNER_CASH_SHIFT: OwnerCashShiftData = {
  id: "shift-1403-05-24",
  status: "open",
  openedAtLabel: "۱۴۰۳/۰۵/۲۴ · ۰۸:۰۰",
  openedByLabel: "سارا محمدی",
  totalExpectedLabel: "۱۲٬۴۵۰٬۰۰۰ تومان",
  totalCountedLabel: "۱۲٬۳۸۰٬۰۰۰ تومان",
  discrepancyReason: "",
  channels: [
    {
      channel: "cash",
      expectedLabel: "۳٬۲۰۰٬۰۰۰ تومان",
      countedLabel: "۳٬۱۵۰٬۰۰۰ تومان",
    },
    {
      channel: "pos",
      expectedLabel: "۵٬۱۰۰٬۰۰۰ تومان",
      countedLabel: "۵٬۱۰۰٬۰۰۰ تومان",
    },
    {
      channel: "card_to_card",
      expectedLabel: "۲٬۸۵۰٬۰۰۰ تومان",
      countedLabel: "۲٬۸۵۰٬۰۰۰ تومان",
    },
    {
      channel: "gateway",
      expectedLabel: "۱٬۳۰۰٬۰۰۰ تومان",
      countedLabel: "۱٬۲۸۰٬۰۰۰ تومان",
    },
  ],
};
