import { describe, expect, it } from "@jest/globals";
import type { AthleteProfile, PublicUser } from "@repo/api";
import {
  buildAthleteSetupTodos,
  missingAthleteUpgradeRoles,
} from "./athlete-home-setup";

function user(overrides: Partial<PublicUser> = {}): PublicUser {
  const { address, avatar, demographics, kyc, name, ...userOverrides } =
    overrides;
  return {
    favouriteLocations: [],
    code: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    id: "user-1",
    nationalId: null,
    phone: "+989120000000",
    phoneVerifiedAt: "2026-01-01T00:00:00.000Z",
    referralCode: null,
    roles: ["athlete"],
    status: "active",
    credentials: { password: "set" },
    ...userOverrides,
    address: {
      apartment: null,
      city: null,
      point: null,
      postalCode: null,
      provinceId: null,
      street: null,
      ...address,
    },
    avatar: { mediaId: null, ...avatar },
    demographics: { birthDate: null, gender: null, ...demographics },
    kyc: { status: "none", verifiedAt: null, ...kyc },
    name: { first: null, last: null, ...name },
  };
}

function athleteProfile(
  overrides: Partial<AthleteProfile> = {},
): AthleteProfile {
  const { body, ...profileOverrides } = overrides;
  return {
    bio: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    goalKeys: [],
    health: {
      allergies: [],
      bloodType: null,
      conditions: null,
      medications: null,
      note: null,
    },
    id: "athlete-1",
    levelKey: null,
    lifestyle: {
      activityKeys: [],
      bodyType: null,
      dailyCalories: null,
      diet: null,
      experience: null,
      mood: null,
      sleepLevel: null,
    },
    metrics: { preferredKeys: [] },
    privacy: {},
    sportIds: [],
    updatedAt: "2026-01-01T00:00:00.000Z",
    userId: "user-1",
    ...profileOverrides,
    body: { heightCm: null, weightKg: null, ...body },
  };
}

describe("missingAthleteUpgradeRoles", () => {
  it("offers coach and club owner when the athlete has neither role", () => {
    expect(missingAthleteUpgradeRoles(["athlete"])).toEqual([
      "coach",
      "club_owner",
    ]);
  });

  it("hides a role the user already holds", () => {
    expect(missingAthleteUpgradeRoles(["athlete", "coach"])).toEqual([
      "club_owner",
    ]);
    expect(
      missingAthleteUpgradeRoles(["athlete", "coach", "club_owner"]),
    ).toEqual([]);
  });
});

describe("buildAthleteSetupTodos", () => {
  it("marks every setup step pending for a bare new account", () => {
    const todos = buildAthleteSetupTodos({
      athleteProfile: null,
      user: user(),
    });

    expect(todos.map((item) => [item.id, item.status, item.href])).toEqual([
      ["profile", "pending", "/athlete/profile/edit"],
      ["location", "pending", "/athlete/profile/edit"],
      ["athleteProfile", "pending", "/athlete/profile/athlete"],
      ["avatar", "pending", "/athlete/profile/edit"],
      ["verify", "pending", "/athlete/profile"],
    ]);
  });

  it("marks profile, location and sport profile from live account data", () => {
    const todos = buildAthleteSetupTodos({
      athleteProfile: athleteProfile({
        body: { heightCm: 178, weightKg: 74 },
        levelKey: "intermediate",
        sportIds: ["football"],
      }),
      user: user({
        address: {
          apartment: null,
          city: "تهران",
          point: null,
          postalCode: null,
          provinceId: "tehran",
          street: null,
        },
        avatar: { mediaId: "avatar-1" },
        demographics: {
          birthDate: "1994-04-12",
          gender: "male",
        },
        kyc: { status: "approved", verifiedAt: "2026-01-02T00:00:00.000Z" },
        name: { first: "امیر", last: "حسینی" },
      }),
    });

    expect(todos.every((item) => item.status === "completed")).toBe(true);
  });

  it("keeps location pending when only a province is set", () => {
    const [location] = buildAthleteSetupTodos({
      athleteProfile: null,
      user: user({
        address: {
          apartment: null,
          city: "  ",
          point: null,
          postalCode: null,
          provinceId: "tehran",
          street: null,
        },
      }),
    }).filter((item) => item.id === "location");

    expect(location?.status).toBe("pending");
  });
});
