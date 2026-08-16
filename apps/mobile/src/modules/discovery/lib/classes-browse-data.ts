import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { MOCK_CLASSES, type HomeClassItem } from "./home-browse-data";

export type BrowseClass = HomeClassItem & {
  /** Optional intensity / popularity hint for rails. */
  intensity?: "high" | "medium" | "low";
};

export type ClassCategoryFilterId = "all" | string;

export type ClassCategoryFilter = {
  id: ClassCategoryFilterId;
  label: string;
};

/** Demo catalog for `/discovery/classes` (offline fallback only). */
export const BROWSE_CLASSES: BrowseClass[] = [
  ...MOCK_CLASSES,
  {
    id: "power-hiit",
    clubId: "heavenly",
    title: "پاور HIIT با تمرکز شکم",
    author: "سارا محمدی",
    category: "آمادگی جسمانی",
    date: "هر روز",
    duration: "۴۵ دقیقه",
    backgroundImage: "/demo/coach-portrait.png",
    intensity: "high",
  },
  {
    id: "strength-circuit",
    clubId: "heavenly",
    title: "سیرکت قدرتی Deluxe",
    author: "علی رضایی",
    category: "بدنسازی",
    date: "زوج",
    duration: "۵۰ دقیقه",
    backgroundImage: PLACEHOLDER_IMAGE,
    intensity: "high",
  },
];

export function buildClassCategoryFilters(
  classes: BrowseClass[],
): ClassCategoryFilter[] {
  const seen = new Set<string>();
  const filters: ClassCategoryFilter[] = [{ id: "all", label: "همه" }];
  for (const item of classes) {
    const key = item.category.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    filters.push({ id: key, label: key });
  }
  return filters;
}

export function filterBrowseClasses(
  classes: BrowseClass[],
  categoryId: ClassCategoryFilterId,
): BrowseClass[] {
  if (categoryId === "all") return classes;
  return classes.filter((item) => item.category === categoryId);
}

export function classesByIntensity(
  classes: BrowseClass[],
  intensity: NonNullable<BrowseClass["intensity"]>,
): BrowseClass[] {
  return classes.filter((item) => item.intensity === intensity);
}

export function getBrowseClass(classId: string): BrowseClass | undefined {
  const id = classId.trim();
  if (!id) return undefined;
  return BROWSE_CLASSES.find((item) => item.id === id);
}
