import { describe, expect, it } from "@jest/globals";
import type { PublicUser } from "@repo/api";
import {
  buildUpdateAthleteInput,
  buildUpdateCoachInput,
  buildUpdateMeInput,
  calendarValueToJalaliDisplay,
  emptyProfileSettingsValues,
  formValuesFromUser,
  formatIranPhoneDisplay,
  isValidUserCode,
  jalaliDisplayToCalendarValue,
  joinFullName,
} from "./profile-settings";

function user(overrides: Partial<PublicUser> = {}): PublicUser {
  const { address, avatar, demographics, kyc, name, ...rest } = overrides;
  return {
    id: "user-1",
    phone: "+989990000001",
    phoneVerifiedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    code: null,
    nationalId: null,
    referralCode: null,
    roles: ["athlete"],
    status: "active",
    favouriteLocations: [],
    credentials: { password: "set" },
    ...rest,
    avatar: { mediaId: null, ...avatar },
    kyc: { status: "none", verifiedAt: null, ...kyc },
    name: { first: null, last: null, ...name },
    demographics: { birthDate: null, gender: null, ...demographics },
    address: {
      apartment: null,
      city: null,
      district: null,
      point: null,
      postalCode: null,
      provinceId: null,
      street: null,
      ...address,
    },
  };
}

describe("profile-settings", () => {
  it("maps nested User name, demographics and address into the form", () => {
    const values = formValuesFromUser(
      user({
        name: { first: "حمیدرضا", last: "یگانه" },
        code: "hamid-yeganeh",
        demographics: { gender: "male", birthDate: "2005-09-05" },
        address: {
          provinceId: "prov-1",
          city: "تهران",
          district: "منطقه ۶",
          street: "ولیعصر",
          apartment: "۱۲",
          postalCode: "1234567890",
          point: { lat: 35.7, lng: 51.4 },
        },
      }),
    );

    expect(values.name).toEqual({ first: "حمیدرضا", last: "یگانه" });
    expect(values.code).toBe("hamid-yeganeh");
    expect(values.gender).toBe("male");
    expect(values.birthDateJalali).toBe("1384/06/14");
    expect(values.address.city).toBe("تهران");
    expect(values.address.mapPoint).toEqual({ lat: 35.7, lng: 51.4 });
  });

  it("sends first/last name and skips invalid handle or postal code", () => {
    const values = emptyProfileSettingsValues();
    values.name = { first: "علی", last: "رضایی" };
    values.gender = "male";
    values.birthDateJalali = "1370/01/01";
    values.address.city = "اصفهان";

    const ok = buildUpdateMeInput(values);
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.input.name).toEqual({ first: "علی", last: "رضایی" });
      expect(ok.input.code).toBeUndefined();
      expect(ok.input.address?.city).toBe("اصفهان");
    }

    values.code = "A";
    expect(buildUpdateMeInput(values)).toEqual({ ok: false, error: "code" });

    values.code = "ali-rezaei";
    values.address.postalCode = "123";
    expect(buildUpdateMeInput(values)).toEqual({
      ok: false,
      error: "postalCode",
    });
  });

  it("formats Iran phone and validates handle / jalali helpers", () => {
    expect(formatIranPhoneDisplay("+989990000001")).toBe("999 0000 001");
    expect(formatIranPhoneDisplay("09120000001")).toBe("912 0000 001");
    expect(joinFullName("حمیدرضا", "یگانه")).toBe("حمیدرضا یگانه");
    expect(isValidUserCode("mahdi-fit")).toBe(true);
    expect(isValidUserCode("Bad Code")).toBe(false);
    expect(jalaliDisplayToCalendarValue("1384/06/14")).toEqual({
      year: 1384,
      month: 6,
      day: 14,
    });
    expect(
      calendarValueToJalaliDisplay({ year: 1384, month: 6, day: 14 }),
    ).toBe("1384/06/14");
  });

  it("maps athlete and coach profile fields with range checks", () => {
    expect(
      buildUpdateAthleteInput({
        bio: "دونده",
        levelKey: "beginner",
        heightCm: "178",
        weightKg: "72",
      }),
    ).toEqual({
      ok: true,
      input: {
        bio: "دونده",
        levelKey: "beginner",
        body: { heightCm: 178, weightKg: 72 },
      },
    });
    expect(
      buildUpdateAthleteInput({
        bio: "",
        levelKey: "",
        heightCm: "10",
        weightKg: "",
      }),
    ).toEqual({ ok: false, error: "height" });
    expect(
      buildUpdateCoachInput({
        bio: "مربی",
        levelKey: "senior",
        headline: "قدرت",
        years: "8",
      }),
    ).toEqual({
      ok: true,
      input: {
        bio: "مربی",
        levelKey: "senior",
        experience: { headline: "قدرت", years: 8 },
      },
    });
    expect(
      buildUpdateCoachInput({ bio: "", levelKey: "", headline: "", years: "99" }),
    ).toEqual({ ok: false, error: "years" });
  });
});
