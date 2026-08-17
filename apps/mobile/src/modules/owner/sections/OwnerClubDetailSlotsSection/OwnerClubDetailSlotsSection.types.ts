import type { OwnerClubDetailSlotDay } from "@/modules/owner/lib/owner-club-detail-data";

export type OwnerClubDetailSlotsSectionProps = {
  title: string;
  hint: string;
  slotDays: OwnerClubDetailSlotDay[];
  className?: string;
};
