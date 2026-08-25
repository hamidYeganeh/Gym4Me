import type { DiscoveryCoach } from "@repo/api/discovery";
import {
  mapDiscoveryCoachToBrowse,
  mapDiscoveryCoachToDetail,
  mapDiscoveryCoachToFeatured,
} from "./map-discovery-coach";

const coach: DiscoveryCoach = {
  id: "profile-identifier-must-not-be-routed",
  userId: "507f1f77bcf86cd799439011",
  user: {
    id: "507f1f77bcf86cd799439011",
    name: { first: "مهسا", last: "احمدی" },
    avatar: { mediaId: null },
    demographics: { gender: "female" },
    code: null,
  },
  bio: null,
  experience: { years: 5, headline: "مربی قدرتی" },
  verification: { status: "approved", reviewedAt: null, credential: null },
  serviceArea: { cityId: null },
  pricing: { consultation: { inPerson: 250_000, remote: null } },
  sportIds: [],
  coachTypes: ["strength-training"],
  createdAt: "2026-08-25T00:00:00.000Z",
  updatedAt: "2026-08-25T00:00:00.000Z",
};

describe("live discovery coach route identity", () => {
  it("uses the coach user id for list, detail and reservation navigation", () => {
    expect(mapDiscoveryCoachToBrowse(coach).id).toBe(coach.userId);
    expect(mapDiscoveryCoachToDetail(coach).id).toBe(coach.userId);
    expect(mapDiscoveryCoachToFeatured(coach).id).toBe(coach.userId);
  });
});
