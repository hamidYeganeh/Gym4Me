export type DashboardHomeHeaderSectionProps = {
  displayName: string;
  loading: boolean;
  onNavigateUsers: () => void;
  onNavigateFinance: () => void;
  onNavigateBookings: () => void;
  onRefresh: () => void;
  className?: string;
};
