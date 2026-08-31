import { describe, expect, it } from "@jest/globals";
import {
  buildCreateClubPayload,
  createEmptyClubCreateForm,
  resultFromSettled,
  toggleCatalogSelection,
} from "./club-create-form";

describe("club-create-form catalog selections", () => {
  it("adds and removes catalog selections with an equipment quantity", () => {
    const selected = toggleCatalogSelection([], "equipment-1", true);
    expect(selected).toEqual([
      { id: "equipment-1", description: "", quantity: 1 },
    ]);
    expect(toggleCatalogSelection(selected, "equipment-1", true)).toEqual([]);
  });

  it("maps selection details to the create-club API model", () => {
    const form = createEmptyClubCreateForm();
    form.name = "باشگاه آزمون";
    form.categories = [
      { id: "category-1", description: "ویژه بانوان", quantity: null },
    ];
    form.equipment = [
      { id: "equipment-1", description: "مدل حرفه‌ای", quantity: 8 },
    ];

    const payload = buildCreateClubPayload(form);

    expect(payload.categories).toEqual([
      { id: "category-1", description: "ویژه بانوان", quantity: undefined },
    ]);
    expect(payload.equipments).toEqual([
      { id: "equipment-1", description: "مدل حرفه‌ای", quantity: 8 },
    ]);
  });

  it("maps nested location hierarchy and coordinates into the create payload", () => {
    const form = createEmptyClubCreateForm();
    form.name = "باشگاه آزمون";
    form.location = {
      countryId: "64b000000000000000000001",
      country: "ایران",
      provinceId: "64b000000000000000000002",
      province: "تهران",
      cityId: "64b000000000000000000003",
      city: "تهران",
      districtId: "64b000000000000000000004",
      district: "ونک",
      address: "خیابان ملاصدرا، پلاک ۱۲",
      point: { lat: 35.757, lng: 51.41 },
    };

    const payload = buildCreateClubPayload(form);

    expect(payload.location).toEqual({
      address: "ایران، تهران، تهران، ونک، خیابان ملاصدرا، پلاک ۱۲",
      point: { lat: 35.757, lng: 51.41 },
      locationId: "64b000000000000000000004",
    });
  });

  it("falls back to city locationId when district is unset", () => {
    const form = createEmptyClubCreateForm();
    form.name = "باشگاه آزمون";
    form.location.cityId = "64b000000000000000000003";
    form.location.city = "تهران";
    form.location.address = "ونک";

    const payload = buildCreateClubPayload(form);

    expect(payload.location?.locationId).toBe("64b000000000000000000003");
    expect(payload.location?.address).toBe("تهران، ونک");
  });

  it("normalizes club phones to E.164 digits for the create payload", () => {
    const form = createEmptyClubCreateForm();
    form.name = "باشگاه آزمون";
    form.phones = [
      { id: "phone-1", number: "912 3456 789", label: "پذیرش" },
      { id: "phone-2", number: "  ", label: "" },
    ];

    const payload = buildCreateClubPayload(form);

    expect(payload.contact?.phones).toEqual([
      { number: "+989123456789", label: "پذیرش" },
    ]);
  });

  it("keeps fulfilled catalog pages and drops rejected ones", () => {
    const fulfilled: PromiseSettledResult<{ result: string[] }> = {
      status: "fulfilled",
      value: { result: ["gym", "pool"] },
    };
    const rejected: PromiseSettledResult<{ result: string[] }> = {
      status: "rejected",
      reason: new Error("unavailable"),
    };

    expect(resultFromSettled(fulfilled)).toEqual(["gym", "pool"]);
    expect(resultFromSettled(rejected)).toEqual([]);
  });
});
