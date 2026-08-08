import { PLACEHOLDER_IMAGE } from "@repo/ui/common";

export type OwnerStaffState = "active" | "invited" | "suspended";

export type OwnerStaffMember = {
  id: string;
  name: string;
  avatar: string;
  /** Named role preset — presentation only; final grants are per member. */
  presetLabel: string;
  branchLabel: string;
  /** Fine-grained permission keys; source of truth for access. */
  grants: string[];
  state: OwnerStaffState;
};

/** Permission key → Persian label. Keys mirror API `PermissionDefinition`. */
export const OWNER_STAFF_GRANT_LABELS: Record<string, string> = {
  "bookings.create": "ثبت رزرو",
  "bookings.read": "مشاهده رزروها",
  "bookings.cancel": "لغو رزرو",
  "members.manage": "مدیریت اعضا",
  "members.read": "مشاهده اعضا",
  "classes.manage": "مدیریت کلاس‌ها",
  "classes.read": "مشاهده کلاس‌ها",
  "finance.read": "مشاهده مالی",
  "finance.settle": "تسویه مالی",
  "staff.manage": "مدیریت پرسنل",
  "equipment.manage": "مدیریت تجهیزات",
};

export const OWNER_STAFF: OwnerStaffMember[] = [
  {
    id: "sara",
    name: "سارا محمدی",
    avatar: "/demo/coach-portrait.png",
    presetLabel: "مدیر شعبه",
    branchLabel: "شعبه ونک",
    grants: [
      "bookings.create",
      "bookings.read",
      "bookings.cancel",
      "members.manage",
      "classes.manage",
      "finance.read",
      "staff.manage",
    ],
    state: "active",
  },
  {
    id: "ali",
    name: "علی رضایی",
    avatar: PLACEHOLDER_IMAGE,
    presetLabel: "پذیرش",
    branchLabel: "شعبه ونک",
    grants: ["bookings.create", "bookings.read", "members.read"],
    state: "active",
  },
  {
    id: "nika",
    name: "نیکا احمدی",
    avatar: PLACEHOLDER_IMAGE,
    presetLabel: "هماهنگ‌کننده کلاس‌ها",
    branchLabel: "شعبه سعادت‌آباد",
    grants: [
      "classes.manage",
      "classes.read",
      "bookings.read",
      "members.read",
      "equipment.manage",
    ],
    state: "active",
  },
  {
    id: "mehdi",
    name: "مهدی کریمی",
    avatar: PLACEHOLDER_IMAGE,
    presetLabel: "حسابدار",
    branchLabel: "همه شعبه‌ها",
    grants: ["finance.read", "finance.settle"],
    state: "invited",
  },
  {
    id: "reza",
    name: "رضا نوری",
    avatar: PLACEHOLDER_IMAGE,
    presetLabel: "پذیرش",
    branchLabel: "شعبه جردن",
    grants: ["bookings.read", "members.read"],
    state: "suspended",
  },
];
