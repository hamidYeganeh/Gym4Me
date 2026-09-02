import type { ApiClient } from "../client";
import type { FavouriteLocation } from "../types";
import type {
  AthleteProfile,
  CoachProfile,
  CreateFavouriteLocationInput,
  FavouriteLocationsList,
  SubmitCoachVerificationInput,
  UpdateAthleteProfileInput,
  UpdateCoachProfileInput,
  UpdateFavouriteLocationInput,
  UpdateMeInput,
  UpdateProfileSettingsInput,
  AccountDeletionRequest,
  RequestAccountDeletionInput,
  CancelAccountDeletionInput,
} from "./profile.dto";
import { accountProfileEndpoints as ep } from "./profile.endpoint";
import { legacyPublicUser } from "../auth/session-adapter";

type CurrentProfile = {
  user?: Record<string, any>;
  profile?: Record<string, any>;
  security?: { password_set?: boolean };
};

const object = (value: unknown): Record<string, any> =>
  value && typeof value === "object" ? (value as Record<string, any>) : {};

const now = () => new Date().toISOString();

function currentCustomData(result: CurrentProfile) {
  return object(result.profile?.customData ?? result.profile?.custom_data);
}

function athleteFrom(result: CurrentProfile): AthleteProfile {
  const profile = object(result.profile);
  const data = object(currentCustomData(result).athlete);
  const body = object(data.body);
  const privacy = object(data.privacy);
  const metrics = object(data.metrics);
  const lifestyle = object(data.lifestyle);
  const health = object(data.health);
  const createdAt = String(profile.createdAt ?? now());
  return {
    id: String(profile._id ?? profile.id ?? result.user?._id ?? ""),
    userId: String(result.user?._id ?? profile.userId ?? ""),
    bio: typeof data.bio === "string" ? data.bio : null,
    levelKey: typeof data.levelKey === "string" ? data.levelKey : null,
    body: {
      heightCm: typeof body.heightCm === "number" ? body.heightCm : null,
      weightKg: typeof body.weightKg === "number" ? body.weightKg : null,
    },
    privacy: {
      ...(privacy.metrics ? { metrics: privacy.metrics } : {}),
      ...(privacy.photos ? { photos: privacy.photos } : {}),
    },
    metrics: {
      preferredKeys: Array.isArray(metrics.preferredKeys) ? metrics.preferredKeys : [],
    },
    sportIds: Array.isArray(data.sportIds) ? data.sportIds : [],
    goalKeys: Array.isArray(data.goalKeys) ? data.goalKeys : [],
    lifestyle: {
      bodyType: lifestyle.bodyType ?? null,
      experience: lifestyle.experience ?? null,
      sleepLevel: typeof lifestyle.sleepLevel === "number" ? lifestyle.sleepLevel : null,
      mood: lifestyle.mood ?? null,
      diet: typeof lifestyle.diet === "string" ? lifestyle.diet : null,
      dailyCalories:
        typeof lifestyle.dailyCalories === "number" ? lifestyle.dailyCalories : null,
      activityKeys: Array.isArray(lifestyle.activityKeys) ? lifestyle.activityKeys : [],
    },
    health: {
      bloodType: health.bloodType ?? null,
      allergies: Array.isArray(health.allergies) ? health.allergies : [],
      conditions: typeof health.conditions === "string" ? health.conditions : null,
      medications: typeof health.medications === "string" ? health.medications : null,
      note: typeof health.note === "string" ? health.note : null,
    },
    createdAt,
    updatedAt: String(profile.updatedAt ?? createdAt),
  };
}

function mergeObjects(base: Record<string, any>, patch: Record<string, any>) {
  const result = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    result[key] =
      value && typeof value === "object" && !Array.isArray(value)
        ? mergeObjects(object(base[key]), value as Record<string, any>)
        : value;
  }
  return result;
}

function coachFrom(value: unknown, userId = ""): CoachProfile {
  const item = object(value);
  const professional = object(item.professional);
  const verification = object(item.verification);
  const custom = object(item.customData ?? item.custom_data);
  const createdAt = String(item.createdAt ?? now());
  const status = String(verification.status ?? "unverified");
  return {
    id: String(item._id ?? item.id ?? userId),
    userId: String(item.userId ?? userId),
    bio: typeof professional.bio === "string"
      ? professional.bio
      : (object(professional.bio).fa ?? null),
    levelKey: typeof custom.levelKey === "string" ? custom.levelKey : null,
    experience: {
      years: typeof professional.experienceYears === "number" ? professional.experienceYears : null,
      headline: typeof professional.headline === "string"
        ? professional.headline
        : (object(professional.headline).fa ?? null),
    },
    verification: {
      status:
        status === "verified"
          ? "approved"
          : status === "pending"
            ? "pending"
            : status === "rejected"
              ? "rejected"
              : "unsubmitted",
      submittedAt: verification.submittedAt ? String(verification.submittedAt) : null,
      reviewedAt: verification.reviewedAt ? String(verification.reviewedAt) : null,
      reviewNote: verification.reason ? String(verification.reason) : null,
      documentMediaIds: Array.isArray(custom.documentMediaIds)
        ? custom.documentMediaIds
        : [],
      credential: custom.credential ?? null,
    },
    serviceArea: { cityId: custom.serviceArea?.cityId ?? null },
    sportIds: Array.isArray(item.specialties)
      ? item.specialties.map((entry: unknown) => String(object(entry)._id ?? entry))
      : [],
    coachTypes: Array.isArray(custom.coachTypes) ? custom.coachTypes : [],
    createdAt,
    updatedAt: String(item.updatedAt ?? createdAt),
  };
}

function updateMeBody(input: UpdateMeInput): Record<string, unknown> {
  const identity: Record<string, unknown> = {};
  if (input.name?.first !== undefined) identity.first_name = input.name.first;
  if (input.name?.last !== undefined) identity.last_name = input.name.last;
  if (input.demographics?.gender !== undefined)
    identity.gender = input.demographics.gender;
  if (input.demographics?.birthDate !== undefined)
    identity.birth_date = input.demographics.birthDate;
  if (input.avatar?.mediaId !== undefined)
    identity.avatar = { mediaId: input.avatar.mediaId };

  return {
    ...(Object.keys(identity).length ? { identity } : {}),
    ...(input.address ? { contact: { address: input.address } } : {}),
    ...(input.code !== undefined ? { custom_data: { code: input.code } } : {}),
  };
}

/** Account profile — base + role profiles (`/account/profile`). */
export function createAccountProfileApi(client: ApiClient) {
  return {
    async getMe() {
      const [profile, access] = await Promise.all([
        client.request<any>(ep.me),
        client.request<any>("/account/access-context"),
      ]);
      return legacyPublicUser(profile, access);
    },

    async updateMe(input: UpdateMeInput) {
      const profile = await client.request<any>(ep.me, {
        method: "PATCH",
        body: updateMeBody(input),
      });
      const access = await client.request<any>("/account/access-context");
      return legacyPublicUser(profile, access);
    },

    getSettings() {
      return client.request<CurrentProfile>(ep.me).then((result) => ({
        units: object(result.profile?.preferences).units ?? {},
      }));
    },

    async updateSettings(input: UpdateProfileSettingsInput) {
      const current = await client.request<CurrentProfile>(ep.me);
      const units = {
        ...object(object(current.profile?.preferences).units),
        ...input.units,
      };
      await client.request<CurrentProfile>(ep.me, {
        method: "PATCH",
        body: { preferences: { units } },
      });
      return { units };
    },

    async listFavouriteLocations() {
      const current = await client.request<CurrentProfile>(ep.me);
      const locations = currentCustomData(current).favouriteLocations;
      return { items: Array.isArray(locations) ? locations : [] } as FavouriteLocationsList;
    },

    async getFavouriteLocation(id: string) {
      const list = await this.listFavouriteLocations();
      const item = list.items.find((entry) => entry.id === id);
      if (!item) throw new Error("Favourite location was not found.");
      return item;
    },

    async createFavouriteLocation(input: CreateFavouriteLocationInput) {
      const current = await client.request<CurrentProfile>(ep.me);
      const items = Array.isArray(currentCustomData(current).favouriteLocations)
        ? [...currentCustomData(current).favouriteLocations]
        : [];
      if (items.length >= 5) throw new Error("You can save at most five locations.");
      if (items.some((entry) => entry.kind === input.kind))
        throw new Error("This location kind is already saved.");
      const item = {
        id: crypto.randomUUID(),
        kind: input.kind,
        label: input.label ?? null,
        address: {
          provinceId: input.address?.provinceId ?? null,
          city: input.address?.city ?? null,
          district: input.address?.district ?? null,
          street: input.address?.street ?? null,
          apartment: input.address?.apartment ?? null,
          postalCode: input.address?.postalCode ?? null,
          point: input.address?.point ?? null,
        },
      } satisfies FavouriteLocation;
      await client.request(ep.me, {
        method: "PATCH",
        body: { custom_data: { favouriteLocations: [...items, item] } },
      });
      return item;
    },

    async updateFavouriteLocation(id: string, input: UpdateFavouriteLocationInput) {
      const current = await client.request<CurrentProfile>(ep.me);
      const items = Array.isArray(currentCustomData(current).favouriteLocations)
        ? [...currentCustomData(current).favouriteLocations]
        : [];
      const index = items.findIndex((entry) => entry.id === id);
      if (index < 0) throw new Error("Favourite location was not found.");
      const previous = items[index];
      const next = {
        ...previous,
        ...input,
        address: input.address
          ? { ...object(previous.address), ...input.address }
          : previous.address,
      };
      if (items.some((entry, itemIndex) => itemIndex !== index && entry.kind === next.kind))
        throw new Error("This location kind is already saved.");
      items[index] = next;
      await client.request(ep.me, {
        method: "PATCH",
        body: { custom_data: { favouriteLocations: items } },
      });
      return next as FavouriteLocation;
    },

    async deleteFavouriteLocation(id: string) {
      const current = await client.request<CurrentProfile>(ep.me);
      const existing = currentCustomData(current).favouriteLocations;
      const items = (Array.isArray(existing) ? existing : []).filter((entry) => entry.id !== id);
      await client.request(ep.me, {
        method: "PATCH",
        body: { custom_data: { favouriteLocations: items } },
      });
      return { items } as FavouriteLocationsList;
    },

    async getAthlete() {
      return athleteFrom(await client.request<CurrentProfile>(ep.me));
    },

    async updateAthlete(input: UpdateAthleteProfileInput) {
      const current = await client.request<CurrentProfile>(ep.me);
      const athlete = mergeObjects(object(currentCustomData(current).athlete), input);
      const updated = await client.request<CurrentProfile>(ep.me, {
        method: "PATCH",
        body: { custom_data: { athlete } },
      });
      return athleteFrom(updated);
    },

    async getCoach() {
      const profile = await client.request<unknown>("/coaches/me");
      const userId = client.getSession()?.user?.id ?? "";
      return coachFrom(profile, userId);
    },

    async updateCoach(input: UpdateCoachProfileInput) {
      const customData = {
        ...(input.levelKey !== undefined ? { levelKey: input.levelKey } : {}),
        ...(input.serviceArea !== undefined ? { serviceArea: input.serviceArea } : {}),
        ...(input.coachTypes !== undefined ? { coachTypes: input.coachTypes } : {}),
      };
      const profile = await client.request<unknown>("/coaches/me", {
        method: "PATCH",
        body: {
          professional: {
            ...(input.bio !== undefined ? { bio: { fa: input.bio } } : {}),
            ...(input.experience?.headline !== undefined
              ? { headline: { fa: input.experience.headline } }
              : {}),
            ...(input.experience?.years !== undefined
              ? { experience_years: input.experience.years }
              : {}),
          },
          ...(input.sportIds !== undefined ? { specialty_ids: input.sportIds } : {}),
          ...(Object.keys(customData).length ? { custom_data: customData } : {}),
        },
      });
      return coachFrom(profile, client.getSession()?.user?.id ?? "");
    },

    async submitCoachVerification(input: SubmitCoachVerificationInput) {
      await client.request("/verifications/coach", {
        method: "POST",
        body: {
          type: "professional_identity",
          documents: input.documentMediaIds.map((id, index) => ({
            id,
            type: "coach_certificate",
            title: `مدرک مربیگری ${index + 1}`,
            file: {
              url: `${client.getBaseUrl()}/uploads/${encodeURIComponent(id)}/content`,
              mime_type: "application/octet-stream",
              size_bytes: 1,
            },
            metadata: {},
          })),
          custom_data: {
            ...(input.note ? { note: input.note } : {}),
            document_media_ids: input.documentMediaIds,
          },
        },
      });
      const profile = await client.request<unknown>("/coaches/me");
      return coachFrom(profile, client.getSession()?.user?.id ?? "");
    },

    getAccountDeletionRequest() {
      return client.request<AccountDeletionRequest | null>(ep.accountDeletion);
    },

    requestAccountDeletion(input: RequestAccountDeletionInput) {
      return client.request<AccountDeletionRequest>(ep.accountDeletion, {
        method: "POST",
        body: input,
      });
    },

    cancelAccountDeletion(input: CancelAccountDeletionInput) {
      return client.request<AccountDeletionRequest>(ep.accountDeletion, {
        method: "DELETE",
        body: input,
      });
    },
  };
}

export type AccountProfileApi = ReturnType<typeof createAccountProfileApi>;
