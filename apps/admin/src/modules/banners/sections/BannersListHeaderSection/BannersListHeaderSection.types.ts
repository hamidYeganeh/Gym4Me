import type { BannerPlacement, PublishStatus } from "@repo/api";

export type BannersListHeaderSectionProps = {
  statusFilter: PublishStatus | "all";
  placementFilter: BannerPlacement | "all";
  onStatusChange: (value: PublishStatus | "all") => void;
  onPlacementChange: (value: BannerPlacement | "all") => void;
  onCreate: () => void;
  onRefresh: () => void;
  className?: string;
};
