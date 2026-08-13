import type { Paginated } from "../types";
import type {
  SocialReport,
  SocialReportStatus,
} from "../social/social.dto";

export type ListAdminSocialReportsQuery = {
  page?: number;
  page_size?: number;
  status?: SocialReportStatus;
};

export type ResolveSocialReportInput = {
  status: Extract<SocialReportStatus, "resolved" | "rejected">;
  note?: string;
};

export type AdminSocialReportsPage = Paginated<SocialReport>;

export type { SocialReport, SocialReportStatus };
