import { describe, expect, it, vi } from "vitest";
import { createAccountAuthApi } from "../src/auth/account.client";
import { createAccountProfileApi } from "../src/account/profile.client";
import { createAccountNotificationsApi } from "../src/account/notifications.client";
import { createApiClient } from "../src/client";
import { createMemoryStorage } from "../src/storage";
import { normalizeBooking } from "../src/booking/bookings.client";
import { createDiscoveryCoachesApi } from "../src/discovery/coaches.client";
import { createMediaApi } from "../src/media/media.client";

describe("legacy app compatibility client", () => {
  it("unwraps the current API response envelope", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: { accepted: true },
          meta: { request_id: "req-1", timestamp: "2026-09-01T00:00:00.000Z" },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    const client = createApiClient({ baseUrl: "https://api.example.com/api/v1", fetch: fetcher });

    await expect(client.request<{ accepted: boolean }>("/health")).resolves.toEqual({
      accepted: true,
    });
  });

  it("uses the current OTP endpoint and request contract", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: { challenge_id: "challenge-1", expires_in: 120, resend_after: 60 },
          meta: { request_id: "req-2", timestamp: "2026-09-01T00:00:00.000Z" },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    const api = createAccountAuthApi(
      createApiClient({ baseUrl: "https://api.example.com/api/v1", fetch: fetcher }),
    );

    const result = await api.requestOtp({ phone: "+989121234567" });

    const [url, init] = fetcher.mock.calls[0]!;
    expect(url).toBe("https://api.example.com/api/v1/account/auth/otp/request");
    expect(init?.body).toBe(
      JSON.stringify({ mobile: "+989121234567", purpose: "LOGIN" }),
    );
    expect(result).toEqual({ expiresInSeconds: 120 });
  });

  it("maps supported app-v1 routes and pagination to the current API", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [{ id: "booking-1" }],
          meta: {
            request_id: "req-3",
            timestamp: "2026-09-01T00:00:00.000Z",
            pagination: { page: 1, limit: 20, total: 1, pages: 1 },
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    const client = createApiClient({ baseUrl: "https://api.example.com/api/v1", fetch: fetcher });

    const result = await client.request<any>("/account/bookings");

    expect(fetcher.mock.calls[0]?.[0]).toBe("https://api.example.com/api/v1/bookings/me");
    expect(result).toEqual({
      result: [{ id: "booking-1" }],
      pagination: {
        page: 1,
        page_size: 20,
        count: 1,
        total: 1,
        prev: null,
        next: null,
      },
    });
  });

  it("uses the current refresh-token body during automatic 401 recovery", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: { access_token: "next-access", refresh_token: "next-refresh" },
            meta: {},
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { ok: true }, meta: {} }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    const storage = createMemoryStorage();
    await storage.set({ accessToken: "old-access", refreshToken: "old-refresh" } as any);
    const client = createApiClient({
      baseUrl: "https://api.example.com/api/v1",
      fetch: fetcher,
      storage,
    });
    client.configureRefresh("/account/auth/token/refresh");

    await expect(client.request("/account/profile/me")).resolves.toEqual({ ok: true });
    expect(fetcher.mock.calls[1]?.[1]?.body).toBe(
      JSON.stringify({ refresh_token: "old-refresh" }),
    );
    expect(storage.get()?.accessToken).toBe("next-access");
  });

  it("adapts the current account profile contract for the apps", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              user: {
                _id: "user-1",
                status: "active",
                contact: { mobile: { value: "+989121234567" } },
                createdAt: "2026-09-01T00:00:00.000Z",
              },
              profile: {
                identity: { firstName: "مهدی", lastName: "تست" },
                customData: {
                  favouriteLocations: [{ id: "home", kind: "home", label: "خانه", address: {} }],
                },
              },
              security: { password_set: true },
            },
            meta: {},
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: { assignments: [{ role_code: "athlete" }] },
            meta: {},
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );
    const profile = createAccountProfileApi(
      createApiClient({ baseUrl: "https://api.example.com/api/v1", fetch: fetcher }),
    );

    await expect(profile.getMe()).resolves.toMatchObject({
      id: "user-1",
      phone: "+989121234567",
      name: { first: "مهدی", last: "تست" },
      roles: ["athlete"],
      credentials: { password: "set" },
      favouriteLocations: [{ id: "home", kind: "home" }],
    });
  });

  it("stores athlete profile and unit settings through the current profile endpoint", async () => {
    const profilePayload = {
      user: { _id: "user-1" },
      profile: {
        _id: "profile-1",
        userId: "user-1",
        preferences: { units: { weight: "kg" } },
        customData: { athlete: { bio: "شروع", body: { heightCm: 180 } } },
      },
      security: { password_set: true },
    };
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (_url, init) => {
      if (init?.method === "PATCH") {
        const body = JSON.parse(String(init.body));
        if (body.custom_data?.athlete) profilePayload.profile.customData.athlete = body.custom_data.athlete;
        if (body.preferences?.units) profilePayload.profile.preferences.units = body.preferences.units;
      }
      return new Response(JSON.stringify({ data: profilePayload, meta: {} }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    const profile = createAccountProfileApi(
      createApiClient({ baseUrl: "https://api.example.com/api/v1", fetch: fetcher }),
    );

    await expect(profile.updateAthlete({ bio: "ادامه", body: { weightKg: 75 } })).resolves.toMatchObject({
      bio: "ادامه",
      body: { heightCm: 180, weightKg: 75 },
    });
    await expect(profile.updateSettings({ units: { distance: "km" } })).resolves.toEqual({
      units: { weight: "kg", distance: "km" },
    });
    expect(fetcher.mock.calls.filter(([, init]) => init?.method === "PATCH")).toHaveLength(2);
    expect(fetcher.mock.calls.every(([url]) => url === "https://api.example.com/api/v1/account/profile/me")).toBe(true);
  });

  it("uploads and resolves media through the current asset endpoints", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({
        data: {
          _id: "64b000000000000000000099",
          profile: { mimeType: "image/png", sizeBytes: 12, originalName: "avatar.png", purpose: "avatar" },
          access: { visibility: "public" },
          file: { url: "https://cdn.example/avatar.png" },
          createdAt: "2026-09-01T00:00:00.000Z",
        },
        meta: {},
      }), { status: 200, headers: { "content-type": "application/json" } }),
    );
    const media = createMediaApi(
      createApiClient({ baseUrl: "https://api.example.com/api/v1", fetch: fetcher }),
    );

    await expect(
      media.upload(new Blob(["png"], { type: "image/png" }), "avatar.png", {
        purpose: "avatar",
        visibility: "public",
      }),
    ).resolves.toMatchObject({ id: "64b000000000000000000099", purpose: "avatar" });
    expect(fetcher.mock.calls[0]?.[0]).toBe(
      "https://api.example.com/api/v1/uploads?visibility=public&purpose=avatar",
    );
    expect(media.fileUrl("64b000000000000000000099")).toBe(
      "https://api.example.com/api/v1/catalog/assets/64b000000000000000000099/content",
    );
  });

  it("adapts notification mutations to the current method and device contract", async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async () =>
      new Response(JSON.stringify({ data: { _id: "device-1", status: "active" }, meta: {} }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const notifications = createAccountNotificationsApi(
      createApiClient({ baseUrl: "https://api.example.com/api/v1", fetch: fetcher }),
    );

    await notifications.markRead("notification-1");
    await notifications.registerDevice({ token: "push-token-123", platform: "android" });

    expect(fetcher.mock.calls[0]?.[0]).toBe(
      "https://api.example.com/api/v1/notifications/notification-1/read",
    );
    expect(fetcher.mock.calls[0]?.[1]?.method).toBe("PATCH");
    expect(JSON.parse(String(fetcher.mock.calls[1]?.[1]?.body))).toMatchObject({
      installation_id: expect.stringMatching(/^legacy-/),
      platform: "android",
      push: { token: "push-token-123", provider: "fcm" },
    });
  });

  it("normalizes current booking aggregates for existing mobile booking screens", () => {
    expect(
      normalizeBooking({
        _id: "64b000000000000000000001",
        customerUserId: "64b000000000000000000002",
        offeringId: "64b000000000000000000003",
        status: "pending_payment",
        allocations: [
          {
            resourceId: "64b000000000000000000004",
            startAt: "2026-09-10T06:00:00.000Z",
            endAt: "2026-09-10T07:00:00.000Z",
          },
        ],
        participants: [{ kind: "self" }],
        pricing: { unitAmountMinor: "500000", discountMinor: "0", totalMinor: "500000" },
        payment: { id: "64b000000000000000000005", status: "pending" },
        offering: { profile: { name: "فیتنس", type: "club_session" } },
        branch: { profile: { name: "شعبه مرکزی", address: { city: "تهران" } } },
        club: { _id: "64b000000000000000000006", profile: { name: "باشگاه تست" } },
        createdAt: "2026-09-01T00:00:00.000Z",
      }),
    ).toMatchObject({
      id: "64b000000000000000000001",
      status: "awaiting_payment",
      startsAt: "2026-09-10T06:00:00.000Z",
      resource: { type: "session", title: "فیتنس" },
      club: { name: "باشگاه تست", address: "تهران" },
      pricing: { total: 50_000 },
      payment: { refId: "64b000000000000000000005" },
    });
  });

  it("normalizes current coach offerings into the sliced booking flow", async () => {
    const coachId = "64b000000000000000000011";
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({
        data: {
          _id: coachId,
          professional: {
            displayName: "سارا رضایی",
            headline: { fa: "مربی قدرتی" },
            bio: { fa: "هشت سال سابقه" },
            experienceYears: 8,
          },
          verification: { status: "verified" },
          offerings: [{
            _id: "64b000000000000000000012",
            branchIds: ["64b000000000000000000013"],
            resourceRequirements: [{
              resourceId: "64b000000000000000000014",
              mode: "required",
            }],
            profile: { name: "جلسه خصوصی", sport: "fitness", serviceMode: "in_person" },
            pricing: { baseAmount: 500000 },
            bookingSettings: { durationMinutes: 60 },
          }],
          createdAt: "2026-09-01T00:00:00.000Z",
          updatedAt: "2026-09-01T00:00:00.000Z",
        },
        meta: {},
      }), { status: 200, headers: { "content-type": "application/json" } }),
    );
    const api = createDiscoveryCoachesApi(
      createApiClient({ baseUrl: "https://api.example.com/api/v1", fetch: fetcher }),
    );

    await expect(api.get(coachId)).resolves.toMatchObject({
      id: coachId,
      user: { name: { first: "سارا", last: "رضایی" } },
      verification: { status: "approved" },
      pricing: { consultation: { inPerson: 50_000 } },
      bookingOptions: [{
        branchId: "64b000000000000000000013",
        offeringId: "64b000000000000000000012",
        resourceId: "64b000000000000000000014",
        durationMinutes: 60,
      }],
    });
    expect(fetcher.mock.calls[0]?.[0]).toBe(
      `https://api.example.com/api/v1/catalog/coaches/${coachId}`,
    );
  });
});
