import { describe, expect, it } from "@jest/globals";
import type { FavouriteLocation } from "@repo/api";
import {
  buildFavouriteLocationInput,
  buildFavouriteLocationUpdateInput,
  emptyFavouriteLocationFormValues,
  favouriteLocationHasContent,
  favouriteLocationLine,
  formValuesFromFavouriteLocation,
} from "./profile-locations";

function location(
  overrides: Partial<FavouriteLocation> = {},
): FavouriteLocation {
  const { address, ...locationOverrides } = overrides;
  return {
    id: "loc-1",
    kind: "home",
    label: "خانه",
    ...locationOverrides,
    address: {
      apartment: "۱۲",
      city: "تهران",
      district: "ونک",
      point: { lat: 35.7, lng: 51.4 },
      postalCode: "1234567890",
      provinceId: "prov-1",
      street: "ولیعصر",
      ...address,
    },
  };
}

describe("profile-locations", () => {
  it("maps a saved location into the form and back", () => {
    const values = formValuesFromFavouriteLocation(location());
    expect(values.kind).toBe("home");
    expect(values.label).toBe("خانه");
    expect(values.address.city).toBe("تهران");
    expect(values.address.district).toBe("ونک");
    expect(values.address.mapPoint).toEqual({ lat: 35.7, lng: 51.4 });

    const built = buildFavouriteLocationInput(values);
    expect(built.ok).toBe(true);
    if (built.ok) {
      expect(built.input.kind).toBe("home");
      expect(built.input.label).toBe("خانه");
      expect(built.input.address?.city).toBe("تهران");
      expect(built.input.address?.district).toBe("ونک");
      expect(built.input.address?.apartment).toBeUndefined();
      expect(built.input.address?.postalCode).toBeUndefined();
      expect(built.input.address?.point).toEqual({ lat: 35.7, lng: 51.4 });
    }
  });

  it("requires a custom title for other locations and a pin or address", () => {
    const values = emptyFavouriteLocationFormValues();
    expect(favouriteLocationHasContent(values.address)).toBe(false);
    expect(buildFavouriteLocationInput(values)).toEqual({
      ok: false,
      error: "content",
    });

    values.address.city = "اصفهان";
    values.kind = "other";
    expect(buildFavouriteLocationInput(values)).toEqual({
      ok: false,
      error: "label",
    });

    values.label = "خانه والدین";
    const built = buildFavouriteLocationInput(values);
    expect(built.ok).toBe(true);
    if (built.ok) {
      expect(built.input).toEqual({
        kind: "other",
        label: "خانه والدین",
        address: {
          provinceId: null,
          city: "اصفهان",
          district: undefined,
          street: undefined,
          point: null,
        },
      });
    }
  });

  it("clears label on update when empty", () => {
    const values = emptyFavouriteLocationFormValues();
    values.address.city = "شیراز";
    const updated = buildFavouriteLocationUpdateInput(values);
    expect(updated.ok).toBe(true);
    if (updated.ok) {
      expect(updated.input.label).toBeNull();
    }
  });

  it("formats the saved address line", () => {
    expect(favouriteLocationLine(location(), "تهران")).toContain("ولیعصر");
    expect(favouriteLocationLine(location(), "تهران")).toContain("ونک");
  });
});
