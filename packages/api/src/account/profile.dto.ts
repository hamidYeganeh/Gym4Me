import type {
  AthleteBodyType,
  AthleteDiet,
  AthleteExperience,
  AthleteMood,
  BloodGroup,
  Privacy,
  RhFactor,
  VerificationStatus,
} from "../types";

export type UpdateAddressInput = {
  provinceId?: string | null;
  city?: string;
  street?: string;
  apartment?: string;
  postalCode?: string;
  point?: { lat: number; lng: number } | null;
};

export type UpdateMeInput = {
  name?: { first?: string; last?: string };
  avatar?: { mediaId?: string | null };
  demographics?: { gender?: string; birthDate?: string };
  address?: UpdateAddressInput;
  code?: string;
};

export type ProfileSettings = {
  units: Record<string, string>;
};

export type UpdateProfileSettingsInput = {
  units?: Record<string, string>;
};

export type AthleteLifestyle = {
  bodyType: AthleteBodyType | null;
  experience: AthleteExperience | null;
  sleepLevel: number | null;
  mood: AthleteMood | null;
  diet: AthleteDiet | null;
  dailyCalories: number | null;
  activityKeys: string[];
};

export type AthleteBloodType = { group: BloodGroup; rh: RhFactor };

export type AthleteHealth = {
  bloodType: AthleteBloodType | null;
  allergies: string[];
  conditions: string | null;
  medications: string | null;
  note: string | null;
};

export type AthleteProfile = {
  id: string;
  userId: string;
  bio: string | null;
  levelKey: string | null;
  body: { heightCm: number | null; weightKg: number | null };
  privacy: { metrics?: Privacy; photos?: Privacy };
  metrics: { preferredKeys: string[] };
  sportIds: string[];
  goalKeys: string[];
  lifestyle: AthleteLifestyle;
  health: AthleteHealth;
  createdAt: string;
  updatedAt: string;
};

export type UpdateAthleteLifestyleInput = {
  bodyType?: AthleteBodyType;
  experience?: AthleteExperience;
  sleepLevel?: number;
  mood?: AthleteMood;
  diet?: AthleteDiet;
  /** null clears the value (user doesn't know their intake). */
  dailyCalories?: number | null;
  activityKeys?: string[];
};

export type UpdateAthleteHealthInput = {
  bloodType?: AthleteBloodType | null;
  allergies?: string[];
  conditions?: string;
  medications?: string;
  note?: string;
};

export type UpdateAthleteProfileInput = {
  bio?: string;
  levelKey?: string;
  body?: { heightCm?: number; weightKg?: number };
  privacy?: { metrics?: Privacy; photos?: Privacy };
  metrics?: { preferredKeys?: string[] };
  sportIds?: string[];
  goalKeys?: string[];
  lifestyle?: UpdateAthleteLifestyleInput;
  health?: UpdateAthleteHealthInput;
};

export type CoachProfile = {
  id: string;
  userId: string;
  bio: string | null;
  experience: { years: number | null; headline: string | null };
  verification: {
    status: VerificationStatus;
    submittedAt: string | null;
    reviewedAt: string | null;
    reviewNote: string | null;
    documentMediaIds: string[];
  };
  serviceArea: { cityId: string | null };
  sportIds: string[];
  specialtyKeys: string[];
  createdAt: string;
  updatedAt: string;
};

export type UpdateCoachProfileInput = {
  bio?: string;
  experience?: { years?: number; headline?: string };
  serviceArea?: { cityId?: string | null };
  sportIds?: string[];
  specialtyKeys?: string[];
};

export type SubmitCoachVerificationInput = {
  documentMediaIds: string[];
  note?: string;
};
