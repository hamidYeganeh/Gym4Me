import { describe, expect, it } from "@jest/globals";
import type { RefItem } from "@repo/api";
import {
  MAX_HOME_CLUB_CATEGORIES,
  mapClubCategoryRefsToHomeItems,
} from "./club-categories-home";

function ref(overrides: Partial<RefItem> = {}): RefItem {
  return {
    id: "cat-1",
    type: "club_category",
    name: "باشگاه بدنسازی و تناسب اندام",
    slug: "gym",
    description: null,
    icon: "BarbellHorizontal",
    coverMediaId: null,
    order: 0,
    status: "approved",
    isActive: true,
    ...overrides,
  };
}

describe("mapClubCategoryRefsToHomeItems", () => {
  it("drops inactive refs and links to discovery clubs", () => {
    const items = mapClubCategoryRefsToHomeItems([
      ref({ id: "inactive", isActive: false }),
      ref({ id: "gym-1", slug: "gym" }),
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: "gym-1",
      slug: "gym",
      href: "/discovery/clubs?categoryId=gym-1",
      count: null,
    });
  });

  it("attaches live counts when a facets map is provided", () => {
    const items = mapClubCategoryRefsToHomeItems(
      [ref({ id: "gym-1", slug: "gym" }), ref({ id: "pool-1", slug: "pool" })],
      new Map([
        ["gym-1", 12],
      ]),
    );

    expect(items.find((item) => item.id === "gym-1")?.count).toBe(12);
    expect(items.find((item) => item.id === "pool-1")?.count).toBe(0);
  });

  it("prefers featured slugs before remaining catalog order", () => {
    const items = mapClubCategoryRefsToHomeItems([
      ref({ id: "winter", slug: "winter-sports-club", name: "زمستانی", order: 0 }),
      ref({ id: "zurkhaneh", slug: "zurkhaneh", name: "زورخانه", order: 1 }),
      ref({ id: "pool", slug: "pool", name: "استخر", order: 8 }),
      ref({ id: "gym", slug: "gym", name: "بدنسازی", order: 9 }),
    ]);

    expect(items.map((item) => item.slug)).toEqual([
      "gym",
      "zurkhaneh",
      "pool",
      "winter-sports-club",
    ]);
  });

  it("caps the home grid and encodes category ids", () => {
    const refs = Array.from({ length: MAX_HOME_CLUB_CATEGORIES + 4 }, (_, index) =>
      ref({
        id: `id ${index}`,
        slug: `extra-${index}`,
        order: index,
      }),
    );

    const items = mapClubCategoryRefsToHomeItems(refs);

    expect(items).toHaveLength(MAX_HOME_CLUB_CATEGORIES);
    expect(items[0]?.href).toBe(
      `/discovery/clubs?categoryId=${encodeURIComponent("id 0")}`,
    );
  });
});
