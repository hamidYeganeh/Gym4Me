export type DisputeCategory = "payment" | "service_quality" | "no_show";

export type DisputeStatus = "open" | "under_review" | "resolved" | "closed";

export type AthleteDispute = {
  id: string;
  category: DisputeCategory;
  relatedEntityId?: string;
  body: string;
  status: DisputeStatus;
  createdAtLabel: string;
};

export type CreateDisputeInput = {
  category: DisputeCategory;
  relatedEntityId?: string;
  body: string;
};

export const DEFAULT_ATHLETE_DISPUTES: AthleteDispute[] = [
  {
    id: "d1",
    category: "payment",
    relatedEntityId: "pay-8821",
    body: "مبلغ دو بار از حسابم کسر شد.",
    status: "under_review",
    createdAtLabel: "۲ روز پیش",
  },
  {
    id: "d2",
    category: "service_quality",
    body: "کیفیت جلسه با مربی مطابق توضیحات نبود.",
    status: "resolved",
    createdAtLabel: "۱ هفته پیش",
  },
];
