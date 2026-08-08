import type { ClubClass, ClubSlot } from "@repo/api";

export type ClubSlotsSectionProps = {
  clubId: string;
  classes: ClubClass[];
  slots: ClubSlot[];
  onChanged: () => void;
};
