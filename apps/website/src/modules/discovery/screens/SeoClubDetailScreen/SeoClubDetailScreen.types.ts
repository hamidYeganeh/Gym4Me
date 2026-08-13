import type { Club, ClubUserReview } from "@repo/api/discovery";
import type { ClubMembershipPlan } from "@repo/api/memberships";

export type SeoClubDetailScreenProps = {
  club: Club & {
    audience?: {
      genderPolicy: string | null;
      ageGroupKeys: string[];
      levelKeys: string[];
      accessibility: string;
    };
  };
  reviews?: ClubUserReview[];
  plans?: ClubMembershipPlan[];
};
