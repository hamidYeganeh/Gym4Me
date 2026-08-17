import type { OwnerClubDetailTabId } from "@/modules/owner/screens/OwnerClubDetailScreen/OwnerClubDetailScreen.types";

export type OwnerClubDetailTabOption = {
  id: OwnerClubDetailTabId;
  label: string;
};

export type OwnerClubDetailTabsSectionProps = {
  tabs: OwnerClubDetailTabOption[];
  activeTab: OwnerClubDetailTabId;
  ariaLabel: string;
  onTabChange: (tab: OwnerClubDetailTabId) => void;
  className?: string;
};
