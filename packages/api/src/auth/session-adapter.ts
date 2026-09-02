import type { ApiClient } from "../client";
import type { AuthSession, PublicUser, Role, TokenPair } from "../types";

type CurrentAuthResult = {
  user_id?: string;
  tokens?: {
    access_token?: string;
    refresh_token?: string;
  };
  access_token?: string;
  refresh_token?: string;
};

function roleOf(value: unknown): Role | null {
  const code = String(value ?? "");
  if (code === "athlete" || code === "coach" || code === "club_owner") return code;
  if (code === "club_staff" || code.includes("branch") || code.includes("reception"))
    return "club_staff";
  if (code === "admin" || code.includes("admin")) return "admin";
  return null;
}

export function legacyTokenPair(input: CurrentAuthResult): TokenPair {
  const source = input.tokens ?? input;
  return {
    accessToken: source.access_token ?? "",
    refreshToken: source.refresh_token ?? "",
  };
}

export function legacyPublicUser(
  profileResult: any,
  accessResult?: any,
  fallbackUserId?: string,
): PublicUser {
  const rawUser = profileResult?.user ?? {};
  const profile = profileResult?.profile ?? {};
  const roles = Array.from(
    new Set<Role>(
      (accessResult?.assignments ?? [])
        .map((item: any) => roleOf(item.role_code))
        .filter((item: Role | null): item is Role => item != null),
    ),
  );
  const identity = profile.identity ?? {};
  const contact = rawUser.contact ?? {};
  const profileContact = profile.contact ?? {};
  const address = profileContact.address ?? {};
  const avatar = identity.avatar ?? {};
  const customData = profile.customData ?? profile.custom_data ?? {};
  const favouriteLocations = Array.isArray(customData.favouriteLocations)
    ? customData.favouriteLocations
    : [];
  return {
    id: String(rawUser._id ?? fallbackUserId ?? ""),
    phone: String(contact.mobile?.value ?? ""),
    name: {
      first: identity.firstName ?? null,
      last: identity.lastName ?? null,
    },
    avatar: { mediaId: avatar.mediaId ? String(avatar.mediaId) : null },
    demographics: {
      gender: identity.gender ?? null,
      birthDate: identity.birthDate ?? null,
    },
    address: {
      provinceId: address.provinceId ?? null,
      city: address.city ?? null,
      district: address.district ?? null,
      street: address.street ?? null,
      apartment: address.apartment ?? null,
      postalCode: address.postalCode ?? null,
      point: address.point ?? null,
    },
    favouriteLocations,
    nationalId: identity.nationalId ?? null,
    roles: roles.length ? roles : ["athlete"],
    code: typeof customData.code === "string" ? customData.code : null,
    referralCode: null,
    status: rawUser.status === "active" ? "active" : "blocked",
    kyc: { status: "none", verifiedAt: null },
    phoneVerifiedAt: contact.mobile?.verifiedAt ?? null,
    credentials: {
      password: profileResult?.security?.password_set ? "set" : "unset",
    },
    createdAt: String(rawUser.createdAt ?? new Date(0).toISOString()),
  };
}

export async function createLegacySession(
  client: ApiClient,
  input: CurrentAuthResult,
  preferredRole?: Role,
): Promise<AuthSession> {
  const tokens = legacyTokenPair(input);
  if (!tokens.accessToken || !tokens.refreshToken)
    throw new Error("Authentication response did not include a token pair.");

  await client.setSession({
    ...tokens,
    activeRole: preferredRole ?? "athlete",
    user: {} as PublicUser,
  });

  const [profileResult, accessResult] = await Promise.all([
    client.request<any>("/account/profile/me"),
    client.request<any>("/account/access-context"),
  ]);
  const user = legacyPublicUser(profileResult, accessResult, input.user_id);
  const activeRole =
    (preferredRole && user.roles.includes(preferredRole) ? preferredRole : user.roles[0]) ??
    "athlete";
  return { ...tokens, activeRole, user, isNewUser: false };
}
