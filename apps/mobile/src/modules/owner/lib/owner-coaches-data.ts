export type OwnerCoachAffiliationStatus =
  | "invited"
  | "active"
  | "suspended";

export type OwnerCoachAffiliation = {
  id: string;
  name: string;
  branchLabel: string;
  commissionPercent: number;
  status: OwnerCoachAffiliationStatus;
  specialties: string[];
};

export const OWNER_COACHES: OwnerCoachAffiliation[] = [
  {
    id: "coach-1",
    name: "سارا محمدی",
    branchLabel: "ونک",
    commissionPercent: 30,
    status: "active",
    specialties: ["بدنسازی", "یوگا"],
  },
  {
    id: "coach-2",
    name: "امیرحسین توکلی",
    branchLabel: "سعادت‌آباد",
    commissionPercent: 25,
    status: "active",
    specialties: ["کراس‌فیت"],
  },
  {
    id: "coach-3",
    name: "لیلا مرادی",
    branchLabel: "جردن",
    commissionPercent: 28,
    status: "invited",
    specialties: ["پیلاتس"],
  },
  {
    id: "coach-4",
    name: "کیوان شریفی",
    branchLabel: "ونک",
    commissionPercent: 20,
    status: "suspended",
    specialties: ["کیک‌بوکسینگ"],
  },
];
