export type {
  Club,
  ClubUserReview,
} from "../account/clubs.dto";

export type DiscoveryClubsQuery = {
  page?: number;
  limit?: number;
  page_size?: number;
  q?: string;
  categoryId?: string;
  sportId?: string;
  locationId?: string;
  direction?: string;
  genderPolicy?: string;
  amenitySlug?: string;
  ageGroupKey?: string;
  levelKey?: string;
  accessibility?: string;
  lng?: number;
  lat?: number;
  radiusMeters?: number;
};

export type CreateDiscoveryReviewInput = {
  rating: number;
  criteria?: { criterionId: string; rating: number }[];
  comment?: string;
  bookingId?: string;
};

export type DiscoveryClubReviewsQuery = Record<
  string,
  string | number | boolean | null | undefined
>;
