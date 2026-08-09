export type WelcomeIntroduceWorkoutCardCopy = {
  category: string;
  title: string;
  coach: string;
  durationValue: string;
  ratingValue: string;
  caloriesValue: string;
};

export type WelcomeIntroduceWorkoutsSectionProps = {
  className?: string;
  isActive: boolean;
  direction: "rtl" | "ltr";
  bookmarkLabel: string;
  durationUnit: string;
  ratingUnit: string;
  caloriesUnit: string;
  cards: WelcomeIntroduceWorkoutCardCopy[];
};
