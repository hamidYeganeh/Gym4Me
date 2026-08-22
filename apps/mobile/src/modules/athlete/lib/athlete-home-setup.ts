import type { AthleteProfile, PublicUser, Role } from "@repo/api";

export const ATHLETE_UPGRADE_ROLES = ["coach", "club_owner"] as const;

export type AthleteUpgradeRole = (typeof ATHLETE_UPGRADE_ROLES)[number];

export type AthleteSetupTodoId = "profile" | "location" | "athleteProfile";

export type AthleteSetupTodo = {
  href: string;
  id: AthleteSetupTodoId;
  status: "completed" | "pending";
};

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

export function missingAthleteUpgradeRoles(
  roles: readonly Role[] | undefined,
): AthleteUpgradeRole[] {
  const held = new Set(roles ?? []);
  return ATHLETE_UPGRADE_ROLES.filter((role) => !held.has(role));
}

export function isAthleteProfileBasicsComplete(user: PublicUser): boolean {
  return (
    hasText(user.name.first) &&
    hasText(user.name.last) &&
    hasText(user.demographics.gender) &&
    Boolean(user.demographics.birthDate)
  );
}

export function isAthleteLocationComplete(user: PublicUser): boolean {
  return hasText(user.address.provinceId) && hasText(user.address.city);
}

export function isAthleteSportProfileComplete(
  profile: AthleteProfile | null,
): boolean {
  if (!profile) return false;
  return profile.body.heightCm != null && profile.body.weightKg != null;
}

export function buildAthleteSetupTodos(input: {
  athleteProfile: AthleteProfile | null;
  user: PublicUser;
}): AthleteSetupTodo[] {
  const { athleteProfile, user } = input;

  return [
    {
      href: "/athlete/profile/edit",
      id: "profile",
      status: isAthleteProfileBasicsComplete(user) ? "completed" : "pending",
    },
    {
      href: "/athlete/profile/edit",
      id: "location",
      status: isAthleteLocationComplete(user) ? "completed" : "pending",
    },
    {
      href: "/athlete/profile/athlete",
      id: "athleteProfile",
      status: isAthleteSportProfileComplete(athleteProfile)
        ? "completed"
        : "pending",
    },
  ];
}
