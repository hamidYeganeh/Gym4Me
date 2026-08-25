import type { CoachType, VerificationStatus } from "../types";

export type DiscoveryCoachesQuery = {
  page?: number;
  limit?: number;
  page_size?: number;
  q?: string;
  sportId?: string;
  cityId?: string;
  coachType?: CoachType;
  gender?: string;
  availability?: "remote" | "in-person";
  verified?: "1" | "true";
  fresh?: "1" | "true";
};

/** Privacy-safe user projection for public coach cards. */
export type DiscoveryCoachUser = {
  id: string;
  name: { first: string | null; last: string | null };
  avatar: { mediaId: string | null };
  demographics: { gender: string | null };
  code: string | null;
};

export type DiscoveryCoachClub = {
  id: string;
  name: string;
  coverMediaId: string | null;
  address: string | null;
};

/** Consultation prices in Tomans; null means the kind is not offered. */
export type CoachConsultationPricing = {
  inPerson: number | null;
  remote: number | null;
};

export type DiscoveryCoach = {
  id: string;
  userId: string;
  user: DiscoveryCoachUser;
  bio: string | null;
  experience: { years: number | null; headline: string | null };
  verification: {
    status: VerificationStatus;
    reviewedAt: string | null;
    credential: {
      typeKey: string;
      issuer: string;
      issuedAt: string | null;
      expiresAt: string;
    } | null;
  };
  serviceArea: { cityId: string | null };
  pricing: { consultation: CoachConsultationPricing };
  sportIds: string[];
  coachTypes: CoachType[];
  clubs?: DiscoveryCoachClub[];
  createdAt: string;
  updatedAt: string;
};
