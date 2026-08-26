export type OwnerInventoryCondition =
  | "good"
  | "needs_repair"
  | "out_of_service";

export type OwnerInventoryItem = {
  id: string;
  name: string;
  quantity: number;
  condition: OwnerInventoryCondition;
  locationLabel: string;
  version?: number;
};

export const OWNER_INVENTORY: OwnerInventoryItem[] = [
  {
    id: "inv-1",
    name: "دستگاه اسکوات",
    quantity: 4,
    condition: "good",
    locationLabel: "سالن وزنه‌برداری · ونک",
  },
  {
    id: "inv-2",
    name: "تردمیل ProForm",
    quantity: 8,
    condition: "needs_repair",
    locationLabel: "سالن هوازی · ونک",
  },
  {
    id: "inv-3",
    name: "دوچرخه ثابت",
    quantity: 6,
    condition: "good",
    locationLabel: "سالن هوازی · سعادت‌آباد",
  },
  {
    id: "inv-4",
    name: "نیمکت پرس سینه",
    quantity: 2,
    condition: "out_of_service",
    locationLabel: "انبار · جردن",
  },
];
