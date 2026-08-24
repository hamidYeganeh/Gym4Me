import { describe, expect, it } from "@jest/globals";
import {
  buildCreateClubPayload,
  createEmptyClubCreateForm,
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
});
