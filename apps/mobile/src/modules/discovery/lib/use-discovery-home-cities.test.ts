import { describe, expect, it } from "@jest/globals";
import { pickHomeCities } from "./use-discovery-home-cities";
import type { HomeLocationItem } from "./home-browse-data";

function city(
  overrides: Partial<HomeLocationItem> = {},
): HomeLocationItem {
  return {
    id: "city-1",
    name: "تهران",
    slug: "tehran-city",
    image: "/tehran.png",
    ...overrides,
  };
}

describe("pickHomeCities", () => {
  it("prefers featured slugs before remaining cities", () => {
    const items = pickHomeCities([
      city({ id: "qom", slug: "qom", name: "قم" }),
      city({ id: "shiraz", slug: "shiraz", name: "شیراز" }),
      city({ id: "tehran", slug: "tehran-city", name: "تهران" }),
    ]);

    expect(items.map((item) => item.slug)).toEqual([
      "tehran-city",
      "shiraz",
      "qom",
    ]);
  });
});
