import type { Privacy, VerificationStatus } from "../types";

export type UpdateMeInput = {
  name?: { first?: string; last?: string };
  avatar?: { mediaId?: string | null };
  demographics?: { gender?: string; birthDate?: string };
  code?: string;
};

export type AthleteProfile = {
  id: string;
  userId: string;
  bio: string | null;
  levelKey: string | null;
  body: { heightCm: number | null; weightKg: number | null };
  privacy: { metrics?: Privacy; photos?: Privacy };
  sportIds: string[];
  goalKeys: string[];
  createdAt: string;
  updatedAt: string;
};

export type UpdateAthleteProfileInput = {
  bio?: string;
  levelKey?: string;
  body?: { heightCm?: number; weightKg?: number };
  privacy?: { metrics?: Privacy; photos?: Privacy };
  sportIds?: string[];
  goalKeys?: string[];
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
