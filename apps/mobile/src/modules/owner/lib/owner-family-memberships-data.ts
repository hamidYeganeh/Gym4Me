export type OwnerFamilyPlanStatus = "active" | "suspended";

export type OwnerFamilyMemberSlot = {
  id: string;
  name?: string;
  phone?: string;
  status: "filled" | "empty";
};

export type OwnerFamilyPlan = {
  id: string;
  planName: string;
  orgLabel: string;
  status: OwnerFamilyPlanStatus;
  slotsTotal: number;
  slots: OwnerFamilyMemberSlot[];
  expiresAtLabel: string;
};

export const OWNER_FAMILY_MEMBERSHIPS: OwnerFamilyPlan[] = [
  {
    id: "fam-1",
    planName: "عضویت خانوادگی ۴ نفره",
    orgLabel: "خانواده احمدی",
    status: "active",
    slotsTotal: 4,
    expiresAtLabel: "۱۴۰۳/۱۲/۲۹",
    slots: [
      { id: "s1", name: "محمد احمدی", phone: "۰۹۱۲۱۱۱۱۱۱۱", status: "filled" },
      { id: "s2", name: "فاطمه احمدی", phone: "۰۹۱۳۲۲۲۲۲۲۲", status: "filled" },
      { id: "s3", name: "علی احمدی", status: "filled" },
      { id: "s4", status: "empty" },
    ],
  },
  {
    id: "fam-2",
    planName: "قرارداد سازمانی",
    orgLabel: "شرکت فناوری پارس",
    status: "active",
    slotsTotal: 10,
    expiresAtLabel: "۱۴۰۴/۰۶/۳۱",
    slots: [
      { id: "s1", name: "کارمند ۱", status: "filled" },
      { id: "s2", name: "کارمند ۲", status: "filled" },
      { id: "s3", status: "empty" },
    ],
  },
  {
    id: "fam-3",
    planName: "عضویت خانوادگی ۲ نفره",
    orgLabel: "خانواده کریمی",
    status: "suspended",
    slotsTotal: 2,
    expiresAtLabel: "۱۴۰۳/۰۴/۱۵",
    slots: [
      { id: "s1", name: "مهدی کریمی", status: "filled" },
      { id: "s2", name: "زهرا کریمی", status: "filled" },
    ],
  },
];
