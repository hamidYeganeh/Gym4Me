import type { CommunityMemberView } from "../../lib/community-data";

export type CommunityStoriesSectionProps = {
  members: CommunityMemberView[];
  onMemberPress?: (memberId: string) => void;
  className?: string;
};
