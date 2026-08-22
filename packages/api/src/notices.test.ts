import { KYC_REQUIRED_CODE } from "./errors";
import { resolveApiNotice, resolveNetworkNotice } from "./notices";

describe("resolveApiNotice", () => {
  it("skips GET success envelopes", () => {
    expect(
      resolveApiNotice({
        ok: true,
        status: 200,
        method: "GET",
        body: { message: "success", result: [] },
      }),
    ).toBeNull();
  });

  it("skips generic mutation success messages", () => {
    expect(
      resolveApiNotice({
        ok: true,
        status: 200,
        method: "POST",
        body: { message: "success" },
      }),
    ).toBeNull();
  });

  it("maps exact English errors to i18n keys", () => {
    expect(
      resolveApiNotice({
        ok: false,
        status: 401,
        method: "POST",
        body: { message: "Invalid phone or password" },
      }),
    ).toEqual({
      variant: "danger",
      messageKey: "exact.invalidPhoneOrPassword",
      sourceText: "Invalid phone or password",
    });
  });

  it("maps not-found copy to an entity pattern", () => {
    expect(
      resolveApiNotice({
        ok: false,
        status: 404,
        method: "GET",
        body: { message: "Club not found" },
      }),
    ).toEqual({
      variant: "danger",
      messageKey: "patterns.notFound",
      params: { entity: "club" },
      sourceText: "Club not found",
    });
  });

  it("maps validation field maps to a warning", () => {
    expect(
      resolveApiNotice({
        ok: false,
        status: 400,
        method: "POST",
        body: { message: { phone: ["phone must be a phone number"] } },
      }),
    ).toEqual({
      variant: "warning",
      messageKey: "errors.validation",
      sourceText: "phone must be a phone number",
    });
  });

  it("maps KYC required to a warning", () => {
    expect(
      resolveApiNotice({
        ok: false,
        status: 403,
        method: "POST",
        body: { code: KYC_REQUIRED_CODE, message: "KYC required" },
      }),
    ).toEqual({
      variant: "warning",
      messageKey: "errors.kycRequired",
      sourceText: "KYC required",
    });
  });

  it("falls back to status keys for unknown copy", () => {
    expect(
      resolveApiNotice({
        ok: false,
        status: 409,
        method: "POST",
        body: { message: "Some new conflict from the API" },
      }),
    ).toMatchObject({
      variant: "danger",
      messageKey: "errors.conflict",
    });
  });

  it("returns a network notice", () => {
    expect(resolveNetworkNotice()).toEqual({
      variant: "danger",
      messageKey: "errors.network",
    });
  });
});
