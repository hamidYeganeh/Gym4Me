export type OwnerWalkInMemberType = "member" | "guest";

export type OwnerWalkInResourceType = "class" | "slot" | "space" | "coach";

export type OwnerWalkInOccurrenceOption = {
  value: string;
  label: string;
  resourceType: Exclude<OwnerWalkInResourceType, "coach">;
};

export type OwnerWalkInBooking = {
  id: string;
  memberOrGuest: OwnerWalkInMemberType;
  name: string;
  phone: string;
  resourceType: OwnerWalkInResourceType;
  resourceLabel: string;
  datetimeLabel: string;
  notes?: string;
  createdAtLabel: string;
};

export const OWNER_WALK_IN_BOOKINGS: OwnerWalkInBooking[] = [
  {
    id: "wb-1",
    memberOrGuest: "member",
    name: "پارسا ملکی",
    phone: "۰۹۱۲۱۲۳۴۵۶۷",
    resourceType: "class",
    resourceLabel: "یوگای صبحگاهی",
    datetimeLabel: "۱۴۰۳/۰۵/۲۵ · ۰۷:۳۰",
    notes: "عضو VIP",
    createdAtLabel: "۱۴۰۳/۰۵/۲۴ · ۱۸:۴۵",
  },
  {
    id: "wb-2",
    memberOrGuest: "guest",
    name: "سحر باقری",
    phone: "۰۹۳۵۹۸۷۶۵۴۳",
    resourceType: "coach",
    resourceLabel: "مربی: سارا محمدی",
    datetimeLabel: "۱۴۰۳/۰۵/۲۶ · ۱۶:۰۰",
    createdAtLabel: "۱۴۰۳/۰۵/۲۴ · ۱۱:۲۰",
  },
];
