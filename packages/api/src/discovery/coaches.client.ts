import type { ApiClient } from "../client";
import type { Paginated } from "../types";
import type {
  DiscoveryCoach,
  DiscoveryCoachBookingOption,
  DiscoveryCoachesQuery,
} from "./coaches.dto";
import { discoveryCoachesEndpoints as ep } from "./coaches.endpoint";

/** Public discovery coaches (`/discovery/coaches`). */
export function createDiscoveryCoachesApi(client: ApiClient) {
  return {
    async list(query: DiscoveryCoachesQuery = {}) {
      const result = await client.request<Paginated<CurrentCoach>>(ep.root, {
        query: currentQuery(query),
        public: true,
      });
      return { ...result, result: result.result.map(normalizeCoach) };
    },

    async get(userId: string) {
      const result = await client.request<CurrentCoach>(ep.byUserId(userId), {
        public: true,
      });
      return normalizeCoach(result);
    },
  };
}

type CurrentOffering = Record<string, unknown> & {
  _id?: unknown;
  branchIds?: unknown[];
  resourceRequirements?: Array<{ resourceId?: unknown; mode?: unknown }>;
  profile?: { name?: unknown; sport?: unknown; serviceMode?: unknown };
  pricing?: { baseAmount?: unknown };
  bookingSettings?: { durationMinutes?: unknown };
};

type CurrentCoach = Record<string, unknown> & {
  _id?: unknown;
  professional?: {
    displayName?: unknown;
    headline?: unknown;
    bio?: unknown;
    experienceYears?: unknown;
    gender?: unknown;
    avatarMediaId?: unknown;
  };
  serviceModes?: unknown[];
  verification?: { status?: unknown; reviewedAt?: unknown };
  offerings?: CurrentOffering[];
  createdAt?: unknown;
  updatedAt?: unknown;
};

const text = (value: unknown): string => (typeof value === "string" ? value : "");
const number = (value: unknown, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;
const localized = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  const map = value as Record<string, unknown>;
  return text(map.fa) || text(map.en) || text(Object.values(map)[0]);
};

function bookingOptions(coach: CurrentCoach): DiscoveryCoachBookingOption[] {
  return (coach.offerings ?? []).flatMap((offering) => {
    const offeringId = text(offering._id);
    const branchId = text(offering.branchIds?.[0]);
    const required = offering.resourceRequirements?.find((item) => item.mode !== "optional");
    const resourceId = text(required?.resourceId);
    if (!offeringId || !branchId || !resourceId) return [];
    const rawMode = text(offering.profile?.serviceMode);
    const serviceMode =
      rawMode === "online" || rawMode === "hybrid" ? rawMode : "in_person";
    return [{
      branchId,
      offeringId,
      resourceId,
      durationMinutes: number(offering.bookingSettings?.durationMinutes, 60),
      name: text(offering.profile?.name) || "جلسه مربی",
      serviceMode,
      price: Math.floor(number(offering.pricing?.baseAmount) / 10),
    }];
  });
}

function normalizeCoach(coach: CurrentCoach): DiscoveryCoach {
  const id = text(coach._id);
  const name = text(coach.professional?.displayName) || "مربی";
  const nameParts = name.trim().split(/\s+/);
  const options = bookingOptions(coach);
  const inPerson = options.filter((item) => item.serviceMode !== "online").map((item) => item.price);
  const remote = options.filter((item) => item.serviceMode !== "in_person").map((item) => item.price);
  const sports = options.map((item) => {
    const offering = (coach.offerings ?? []).find((candidate) => text(candidate._id) === item.offeringId);
    return text(offering?.profile?.sport);
  }).filter(Boolean);
  const createdAt = text(coach.createdAt) || new Date(0).toISOString();
  return {
    id,
    userId: id,
    user: {
      id,
      name: { first: nameParts[0] ?? name, last: nameParts.slice(1).join(" ") || null },
      avatar: { mediaId: text(coach.professional?.avatarMediaId) || null },
      demographics: { gender: text(coach.professional?.gender) || null },
      code: null,
    },
    bio: localized(coach.professional?.bio) || null,
    experience: {
      years: number(coach.professional?.experienceYears) || null,
      headline: localized(coach.professional?.headline) || null,
    },
    verification: {
      status: coach.verification?.status === "verified" ? "approved" : "pending",
      reviewedAt: text(coach.verification?.reviewedAt) || null,
      credential: null,
    },
    serviceArea: { cityId: null },
    pricing: {
      consultation: {
        inPerson: inPerson.length ? Math.min(...inPerson) : null,
        remote: remote.length ? Math.min(...remote) : null,
      },
    },
    sportIds: sports,
    coachTypes: [],
    clubs: [...new Set(options.map((item) => item.branchId))].map((branchId) => ({
      id: branchId,
      name: "محل تمرین",
      coverMediaId: null,
      address: null,
    })),
    bookingOptions: options,
    createdAt,
    updatedAt: text(coach.updatedAt) || createdAt,
  };
}

function currentQuery(query: DiscoveryCoachesQuery): Record<string, string | number | undefined> {
  const mode = query.availability === "remote"
    ? "online"
    : query.availability === "in-person"
      ? "in_person"
      : undefined;
  return {
    page: query.page,
    limit: query.limit ?? query.page_size,
    search: query.q,
    service_mode: mode,
    gender: query.gender,
  };
}

export type DiscoveryCoachesApi = ReturnType<typeof createDiscoveryCoachesApi>;
