import type { ClubDetail } from "../../lib/club-detail-data";

export type DiscoveryClubsDetailCalendarSectionProps = {
  club: ClubDetail;
  /**
   * When set, only occurrences for this class are listed (class detail page).
   */
  classId?: string;
  /**
   * When set, only occurrences for this coach are listed (coach detail page).
   */
  coachId?: string;
  /** Override the section title (defaults to ClubDetail.calendarTitle). */
  title?: string;
  /** Override the header “see all” href (defaults to club slots list). */
  seeAllHref?: string;
};
