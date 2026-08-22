export type ProfileRoleSegment = "athlete" | "coach" | "owner";

export type ProfileStatKey = {
  key: string;
  labelKey: string;
  valueKey: string;
};

export type ProfileAchievementKey = {
  key: string;
  labelKey: string;
  tone:
    | "accent"
    | "stats-red"
    | "stats-blue"
    | "stats-yellow"
    | "stats-purple"
    | "stats-orange"
    | "stats-green"
    | "stats-navy"
    | "stats-midnight"
    | "stats-rose"
    | "stats-forest"
    | "muted";
  unlocked: boolean;
};

export type ProfileRoleShowcase = {
  subtitleKey: string;
  primaryCtaKey: string;
  stats: ProfileStatKey[];
  tags: string[];
  benefits: string[];
  achievements: ProfileAchievementKey[];
};

const athleteShowcase: ProfileRoleShowcase = {
  subtitleKey: "heroSubtitleAthlete",
  primaryCtaKey: "athleteProfile",
  stats: [
    { key: "sessions", labelKey: "statSessions", valueKey: "statSessionsValue" },
    { key: "streak", labelKey: "statStreak", valueKey: "statStreakValue" },
  ],
  tags: ["tagStrength", "tagCardio", "tagNutrition", "tagRecovery"],
  benefits: [
    "benefitAthleteMetrics",
    "benefitAthleteBookings",
    "benefitAthleteCoaches",
    "benefitAthleteWallet",
  ],
  achievements: [
    {
      key: "heart",
      labelKey: "achievementHeart",
      tone: "stats-orange",
      unlocked: true,
    },
    {
      key: "goal",
      labelKey: "achievementGoal",
      tone: "stats-yellow",
      unlocked: true,
    },
    {
      key: "strength",
      labelKey: "achievementStrength",
      tone: "stats-red",
      unlocked: true,
    },
    {
      key: "nutrition",
      labelKey: "achievementNutrition",
      tone: "accent",
      unlocked: true,
    },
    {
      key: "hiit",
      labelKey: "achievementHiit",
      tone: "muted",
      unlocked: false,
    },
    {
      key: "cycle",
      labelKey: "achievementCycle",
      tone: "muted",
      unlocked: false,
    },
  ],
};

const coachShowcase: ProfileRoleShowcase = {
  subtitleKey: "heroSubtitleCoach",
  primaryCtaKey: "coachProfile",
  stats: [
    { key: "clients", labelKey: "statClients", valueKey: "statClientsValue" },
    { key: "rating", labelKey: "statRating", valueKey: "statRatingValue" },
  ],
  tags: ["tagStrengthCoach", "tagCertified", "tagExperience", "tagOnline"],
  benefits: [
    "benefitCoachPrograms",
    "benefitCoachCalendar",
    "benefitCoachClients",
    "benefitCoachEarnings",
  ],
  achievements: [
    {
      key: "verified",
      labelKey: "achievementVerified",
      tone: "accent",
      unlocked: true,
    },
    {
      key: "mentor",
      labelKey: "achievementMentor",
      tone: "stats-blue",
      unlocked: true,
    },
    {
      key: "transform",
      labelKey: "achievementTransform",
      tone: "stats-purple",
      unlocked: true,
    },
    {
      key: "elite",
      labelKey: "achievementElite",
      tone: "muted",
      unlocked: false,
    },
  ],
};

const ownerShowcase: ProfileRoleShowcase = {
  subtitleKey: "heroSubtitleOwner",
  primaryCtaKey: "clubCreate",
  stats: [
    { key: "members", labelKey: "statMembers", valueKey: "statMembersValue" },
    { key: "clubs", labelKey: "statClubs", valueKey: "statClubsValue" },
  ],
  tags: ["tagPremium", "tagStaff", "tagClasses", "tagAnalytics"],
  benefits: [
    "benefitOwnerClubs",
    "benefitOwnerStaff",
    "benefitOwnerBookings",
    "benefitOwnerFinance",
  ],
  achievements: [
    {
      key: "community",
      labelKey: "achievementCommunity",
      tone: "stats-orange",
      unlocked: true,
    },
    {
      key: "rating",
      labelKey: "achievementFiveStar",
      tone: "stats-yellow",
      unlocked: true,
    },
    {
      key: "growth",
      labelKey: "achievementGrowth",
      tone: "accent",
      unlocked: true,
    },
    {
      key: "network",
      labelKey: "achievementNetwork",
      tone: "muted",
      unlocked: false,
    },
  ],
};

export function getProfileRoleShowcase(
  roleSegment: ProfileRoleSegment,
): ProfileRoleShowcase {
  if (roleSegment === "coach") return coachShowcase;
  if (roleSegment === "owner") return ownerShowcase;
  return athleteShowcase;
}

export function profileRolePrimaryHref(roleSegment: ProfileRoleSegment): string {
  if (roleSegment === "coach") return "/coach/profile/coach";
  if (roleSegment === "owner") return "/owner/clubs/create";
  return "/athlete/profile/athlete";
}
