import type { ApiClient } from "../client";
import type { ItemsResponse, Paginated } from "../types";
import type {
  Club,
  ClubUserReview,
  CreateDiscoveryReviewInput,
  DiscoveryClubFacets,
  DiscoveryClubReviewsQuery,
  DiscoveryClubsQuery,
} from "./clubs.dto";
import { discoveryClubsEndpoints as ep } from "./clubs.endpoint";

function catalogQuery(query: DiscoveryClubsQuery) {
  return {
    page: query.page,
    limit: query.limit ?? query.page_size,
    search: query.q,
    sport: query.sportId,
    gender_policy: query.genderPolicy,
    amenities: query.amenitySlug,
    latitude: query.lat,
    longitude: query.lng,
    radius_km:
      query.radiusMeters === undefined ? undefined : Math.max(0.1, query.radiusMeters / 1_000),
  };
}

function reference(value: unknown, kind: string) {
  if (typeof value === "string") return { id: value, name: value, slug: value, type: kind };
  const item = (value ?? {}) as Record<string, any>;
  return {
    id: String(item.id ?? item._id ?? item.code ?? item.slug ?? item.name ?? ""),
    name: String(item.name ?? item.title ?? item.code ?? ""),
    slug: String(item.slug ?? item.code ?? ""),
    type: kind,
  };
}

/** Adapt the new branch-centric catalog to the legacy display DTO during migration. */
function asDiscoveryClub(input: any): Club {
  const profile = input?.profile ?? {};
  const club = input?.club ?? {};
  const clubProfile = club.profile ?? {};
  const coordinates = Array.isArray(input?.location?.coordinates)
    ? input.location.coordinates
    : [];
  const periods = (input?.workingHours ?? []).flatMap((day: any) =>
    day.status === "active" && day.periods?.length
      ? day.periods.map((period: any) => ({
          weekday: Number(day.dayOfWeek ?? 0),
          status: "open" as const,
          audience: "shared" as const,
          open: period.opensAt,
          close: period.closesAt,
        }))
      : [{ weekday: Number(day.dayOfWeek ?? 0), status: "closed" as const }],
  );
  const images = profile.images ?? clubProfile.images ?? [];
  const firstImage = images.find((item: any) => item?.mediaId)?.mediaId ?? null;
  return {
    id: String(input?._id ?? input?.id ?? ""),
    ownerId: String(club.organizationId ?? ""),
    parentClubId: String(club._id ?? input?.clubId ?? "") || null,
    identity: {
      name: String(profile.name ?? clubProfile.name ?? "باشگاه"),
      description: profile.description?.fa ?? clubProfile.description?.fa ?? null,
      coverMediaId: firstImage,
    },
    contact: { phones: profile.contact?.phones ?? [] },
    gallery: images
      .filter((item: any) => item?.mediaId)
      .map((item: any) => ({ mediaId: String(item.mediaId), title: null, description: null })),
    cancellation: { rules: [], peakRules: [] },
    equipments: [],
    amenities: (club.amenities ?? []).map((item: unknown) => reference(item, "amenity")),
    categories: [],
    sports: (club.sports ?? []).map((item: unknown) => reference(item, "sport")),
    classes: [],
    coaches: [],
    location: {
      address: String(
        profile.address?.formatted ??
          profile.address?.address ??
          [profile.address?.city, profile.address?.district].filter(Boolean).join("، ") ??
          "",
      ),
      point:
        coordinates.length === 2
          ? { lng: Number(coordinates[0]), lat: Number(coordinates[1]) }
          : null,
      direction: null,
      locationId: null,
      ancestors: [],
    },
    audience: {
      genderPolicy: profile.genderPolicy ?? "all",
      ageGroupKeys: [],
      levelKeys: [],
      accessibility: "unknown",
    },
    reviewsSummary: {
      count: Number(input?.reviewStats?.count ?? 0),
      average: Number(input?.reviewStats?.average ?? 0),
      distribution: [],
      criteria: [],
    },
    operatingHours: periods,
    socials: [],
    achievements: [],
    rules: [],
    faq: [],
    review: {
      status: "approved",
      submittedAt: null,
      reviewedAt: null,
      reviewNote: null,
      documentMediaIds: [],
    },
    operationalStatus: input?.status === "active" ? "active" : "inactive",
    createdAt: String(input?.createdAt ?? new Date(0).toISOString()),
    updatedAt: String(input?.updatedAt ?? input?.createdAt ?? new Date(0).toISOString()),
  };
}

/** Public discovery clubs (`/discovery/clubs`). */
export function createDiscoveryClubsApi(client: ApiClient) {
  return {
    async list(query: DiscoveryClubsQuery = {}) {
      const page = await client.request<Paginated<any>>(ep.root, {
        query: catalogQuery(query),
        public: true,
      });
      return { ...page, result: page.result.map(asDiscoveryClub) } as Paginated<Club>;
    },

    listFacets() {
      return client.request<DiscoveryClubFacets>(ep.facets, {
        public: true,
      });
    },

    async get(clubId: string) {
      return asDiscoveryClub(await client.request<any>(ep.byId(clubId), { public: true }));
    },

    listReviews(clubId: string, query: DiscoveryClubReviewsQuery = {}) {
      return client.request<Paginated<ClubUserReview>>(ep.reviews(clubId), {
        query,
        public: true,
      });
    },

    createReview(clubId: string, input: CreateDiscoveryReviewInput) {
      return client.request<ClubUserReview>(ep.reviews(clubId), {
        method: "POST",
        body: input,
      });
    },

    listBranches(clubId: string) {
      return client.request<ItemsResponse<Club>>(ep.branches(clubId), {
        public: true,
      });
    },

    listClasses(clubId: string) {
      return client.request<ItemsResponse<{ classId: string }>>(
        ep.classes(clubId),
        { public: true },
      );
    },

    listCoaches(clubId: string) {
      return client.request<ItemsResponse<{ coachId: string }>>(
        ep.coaches(clubId),
        { public: true },
      );
    },
  };
}

export type DiscoveryClubsApi = ReturnType<typeof createDiscoveryClubsApi>;
