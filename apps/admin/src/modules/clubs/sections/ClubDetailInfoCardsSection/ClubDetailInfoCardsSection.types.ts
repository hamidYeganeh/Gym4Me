import type { Club, ClubClass, ClubSlot } from "@repo/api";

export type ClubDetailInfoCardsSectionProps = {
  club: Club;
  coaches: Club["coaches"];
  branches: Club[];
  classes: ClubClass[];
  slots: ClubSlot[];
  onChanged: () => void;
  className?: string;
};
