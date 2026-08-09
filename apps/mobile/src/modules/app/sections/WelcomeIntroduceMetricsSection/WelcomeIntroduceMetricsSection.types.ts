export type WelcomeIntroduceMetricsSectionProps = {
  className?: string;
  isActive: boolean;
  periodToday: string;
  cards: {
    weight: { title: string; value: string; unit: string; status: string };
    pressure: { title: string; value: string; unit: string; status: string };
    heart: { title: string; value: string; unit: string; status: string };
  };
};
