export type DashboardStatItem = {
  label: string;
  value: string;
};

export type DashboardHomeStatsSectionProps = {
  title: string;
  description: string;
  stats: DashboardStatItem[];
  className?: string;
};
