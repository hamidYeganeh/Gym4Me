export type DailyPoint = { date: string; value: number };

/** Mirrors `AdminAnalyticsService.overview`. */
export type AdminAnalyticsOverview = {
  totals: {
    users: number;
    usersNew30d: number;
    activeClubs: number;
    verifiedCoaches: number;
    activeMemberships: number;
    bookings30d: number;
    gmv30d: number;
    revenue30d: number;
  };
  queues: {
    pendingKyc: number;
    pendingCoachVerifications: number;
    pendingClubReviews: number;
    openSupportTickets: number;
    openSocialReports: number;
    refundRequests: number;
  };
  series: {
    revenueDaily: DailyPoint[];
    signupsDaily: DailyPoint[];
    bookingsDaily: DailyPoint[];
  };
  generatedAt: string;
};
