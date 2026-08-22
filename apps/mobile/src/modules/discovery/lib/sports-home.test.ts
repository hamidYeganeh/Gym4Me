import { describe, expect, it } from "@jest/globals";
import type { SportNode } from "@repo/api";
import {
  MAX_HOME_SPORTS,
  mapSportCategoryNodesToHomeItems,
  mapSportNodesToHomeItems,
  sportCategoryHomeHref,
  sportHomeHref,
} from "./sports-home";

function node(overrides: Partial<SportNode> = {}): SportNode {
  return {
    id: "sport-1",
    kind: "sport",
    name: "فوتبال",
    slug: "football",
    description: null,
    icon: "Soccer",
    coverMediaId: null,
    parentId: "cat-ball",
    parent: null,
    ancestors: [],
    order: 0,
    isActive: true,
    ...overrides,
  };
}

describe("sports-home", () => {
  it("builds sport and category hrefs", () => {
    expect(sportHomeHref("abc")).toBe("/discovery/sports/abc");
    expect(sportCategoryHomeHref("cat 1")).toBe(
      `/discovery/sports?category=${encodeURIComponent("cat 1")}`,
    );
  });

  it("keeps only active sports and prefers featured slugs", () => {
    const items = mapSportNodesToHomeItems([
      node({ id: "inactive", isActive: false }),
      node({ id: "yoga", slug: "yoga", name: "یوگا", order: 0 }),
      node({ id: "football", slug: "football", name: "فوتبال", order: 9 }),
      node({
        id: "cat",
        kind: "category",
        slug: "fitness",
        name: "آمادگی",
      }),
    ]);

    expect(items.map((item) => item.slug)).toEqual(["football", "yoga"]);
  });

  it("maps active categories to the sports browse query", () => {
    const items = mapSportCategoryNodesToHomeItems([
      node({
        id: "combat",
        kind: "category",
        slug: "combat",
        name: "رزمی",
      }),
      node({
        id: "fitness",
        kind: "category",
        slug: "fitness",
        name: "آمادگی جسمانی",
        order: 9,
      }),
    ]);

    expect(items.map((item) => item.slug)).toEqual(["fitness", "combat"]);
    expect(items[0]?.href).toBe("/discovery/sports?category=fitness");
  });

  it("caps the home sports rail", () => {
    const nodes = Array.from({ length: MAX_HOME_SPORTS + 5 }, (_, index) =>
      node({
        id: `s-${index}`,
        slug: `extra-${index}`,
        name: `ورزش ${index}`,
        order: index,
      }),
    );

    expect(mapSportNodesToHomeItems(nodes)).toHaveLength(MAX_HOME_SPORTS);
  });
});
