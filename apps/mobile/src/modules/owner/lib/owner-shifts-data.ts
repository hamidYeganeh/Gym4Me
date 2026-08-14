export type OwnerLeaveStatus = "pending" | "approved" | "rejected";

export type OwnerStaffShift = {
  id: string;
  staffName: string;
  dateLabel: string;
  timeLabel: string;
  branchLabel: string;
};

export type OwnerLeaveRequest = {
  id: string;
  staffName: string;
  fromLabel: string;
  toLabel: string;
  reason: string;
  status: OwnerLeaveStatus;
};

export const OWNER_SHIFTS: OwnerStaffShift[] = [
  {
    id: "shift-1",
    staffName: "علی رضایی",
    dateLabel: "۱۴۰۳/۰۵/۲۵",
    timeLabel: "۰۸:۰۰ – ۱۶:۰۰",
    branchLabel: "ونک",
  },
  {
    id: "shift-2",
    staffName: "نیکا احمدی",
    dateLabel: "۱۴۰۳/۰۵/۲۵",
    timeLabel: "۱۴:۰۰ – ۲۲:۰۰",
    branchLabel: "سعادت‌آباد",
  },
  {
    id: "shift-3",
    staffName: "سارا محمدی",
    dateLabel: "۱۴۰۳/۰۵/۲۶",
    timeLabel: "۰۹:۰۰ – ۱۷:۰۰",
    branchLabel: "ونک",
  },
];

export const OWNER_LEAVE_REQUESTS: OwnerLeaveRequest[] = [
  {
    id: "leave-1",
    staffName: "مهدی کریمی",
    fromLabel: "۱۴۰۳/۰۶/۰۱",
    toLabel: "۱۴۰۳/۰۶/۰۳",
    reason: "مرخصی استحقاقی",
    status: "pending",
  },
  {
    id: "leave-2",
    staffName: "رضا نوری",
    fromLabel: "۱۴۰۳/۰۵/۲۰",
    toLabel: "۱۴۰۳/۰۵/۲۱",
    reason: "امور شخصی",
    status: "approved",
  },
  {
    id: "leave-3",
    staffName: "نیکا احمدی",
    fromLabel: "۱۴۰۳/۰۵/۱۸",
    toLabel: "۱۴۰۳/۰۵/۱۹",
    reason: "تداخل شیفت",
    status: "rejected",
  },
];
