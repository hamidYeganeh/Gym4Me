import {
  BarbellDiagonal,
  Heart,
  HeartEcg,
  PersonBiking,
  PersonKarate,
  PersonSwimming,
  StepSneaker,
  WaterGlassMedium,
  WeightScale,
} from "@repo/icons";

/** Introduce carousel slides (hero Get Started lives on `/welcome`). */
export const WELCOME_INTRODUCE_SLIDE_COUNT = 11;

export const WELCOME_INTRODUCE_ACHIEVEMENT_CARDS = [
  {
    id: "hydration",
    tone: "blue" as const,
    badgeShape: "hex" as const,
    icon: WaterGlassMedium,
    rotate: -11,
    slot: "left" as const,
    float: { y: [0, -7, 0] as number[], duration: 4.8, delay: 0.55 },
    titleKey: "achievements.hydration.title",
  },
  {
    id: "fitness",
    tone: "orange" as const,
    badgeShape: "hex" as const,
    icon: BarbellDiagonal,
    rotate: 0,
    slot: "center" as const,
    float: { y: [0, -9, 0] as number[], duration: 4.2, delay: 0.4 },
    titleKey: "achievements.fitness.title",
  },
  {
    id: "steps",
    tone: "silver" as const,
    badgeShape: "shield" as const,
    icon: StepSneaker,
    rotate: 11,
    slot: "right" as const,
    float: { y: [0, -6, 0] as number[], duration: 5, delay: 0.75 },
    titleKey: "achievements.steps.title",
  },
] as const;

export const WELCOME_INTRODUCE_METRIC_CARDS = [
  {
    id: "weight",
    tone: "weight" as const,
    icon: WeightScale,
    trailing: "chevron" as const,
    titleKey: "metrics.weight.title",
    valueKey: "metrics.weight.value",
    unitKey: "metrics.weight.unit",
    statusKey: "metrics.weight.status",
  },
  {
    id: "pressure",
    tone: "pressure" as const,
    icon: HeartEcg,
    trailing: "warning" as const,
    titleKey: "metrics.pressure.title",
    valueKey: "metrics.pressure.value",
    unitKey: "metrics.pressure.unit",
    statusKey: "metrics.pressure.status",
  },
  {
    id: "heart",
    tone: "heart" as const,
    icon: Heart,
    trailing: "chevron" as const,
    titleKey: "metrics.heart.title",
    valueKey: "metrics.heart.value",
    unitKey: "metrics.heart.unit",
    statusKey: "metrics.heart.status",
  },
] as const;

export const WELCOME_INTRODUCE_WORKOUT_CARDS = [
  {
    id: "jogging",
    categoryTone: "accent" as const,
    categoryKey: "workouts.cards.jogging.category",
    titleKey: "workouts.cards.jogging.title",
    coachKey: "workouts.cards.jogging.coach",
    duration: "45",
    rating: "4.6",
    calories: "320",
  },
  {
    id: "backAbs",
    categoryTone: "blue" as const,
    categoryKey: "workouts.cards.backAbs.category",
    titleKey: "workouts.cards.backAbs.title",
    coachKey: "workouts.cards.backAbs.coach",
    duration: "50",
    rating: "4.3",
    calories: "241",
  },
  {
    id: "yoga",
    categoryTone: "purple" as const,
    categoryKey: "workouts.cards.yoga.category",
    titleKey: "workouts.cards.yoga.title",
    coachKey: "workouts.cards.yoga.coach",
    duration: "40",
    rating: "4.5",
    calories: "180",
  },
] as const;

export const WELCOME_INTRODUCE_ACTIVITY_CARDS = [
  {
    id: "cycling",
    titleKey: "activities.cycling",
    toneKey: "activities.toneLight",
    icon: PersonBiking,
    tone: "light" as const,
    /** Top-left card — slight CCW tilt (Sandow activities frame). */
    rotate: -12,
    slot: "cycling" as const,
    float: { y: [0, -8, 0] as number[], duration: 4.4, delay: 0.55 },
  },
  {
    id: "kickboxing",
    titleKey: "activities.kickboxing",
    toneKey: "activities.toneCalm",
    icon: PersonKarate,
    tone: "calm" as const,
    /** Bottom-left — CW tilt. */
    rotate: 12,
    slot: "kickboxing" as const,
    float: { y: [0, -6, 0] as number[], duration: 5.1, delay: 0.85 },
  },
  {
    id: "swimming",
    titleKey: "activities.swimming",
    toneKey: "activities.toneIntense",
    icon: PersonSwimming,
    tone: "intense" as const,
    /** Bottom-right — mild CCW tilt. */
    rotate: -8,
    slot: "swimming" as const,
    float: { y: [0, -9, 0] as number[], duration: 4.7, delay: 0.7 },
  },
] as const;
