import type { Club } from "@repo/api/discovery";

export type SeoClubDetailScreenProps = {
  club: Club & {
    audience?: {
      genderPolicy: string | null;
      ageGroupKeys: string[];
      levelKeys: string[];
      accessibility: string;
    };
  };
};
