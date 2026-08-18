import type { DiscoverySearchUser } from "../../lib/discovery-search-data";

export type DiscoverySearchUsersSectionProps = {
  users: DiscoverySearchUser[];
  followingIds: ReadonlySet<string>;
  title: string;
  followLabel: string;
  followingLabel: string;
  emptyLabel: string;
  joinedLabel: (year: number) => string;
  followAria: (name: string) => string;
  unfollowAria: (name: string) => string;
  openUserAria: (name: string) => string;
  onOpen: (user: DiscoverySearchUser) => void;
  onFollow: (user: DiscoverySearchUser) => void;
  className?: string;
};
