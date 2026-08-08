import type { OwnerClubDetail } from "../../lib/owner-club-detail-data";

export type OwnerClubDetailTabId =
  | "overview"
  | "branches"
  | "classes"
  | "slots";

export type OwnerClubDetailScreenProps = {
  club: OwnerClubDetail;
  className?: string;
};
