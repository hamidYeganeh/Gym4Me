import { swiperFreeOptions } from "@repo/ui/lib/swiper";

/** Matches `gap-3` on discovery rails. */
export const DISCOVERY_HOME_CAROUSEL_GAP = 12;

export const CLUB_CATEGORY_GRID_ROWS = 2;

export const discoveryHomeCarouselClassNames = {
  carousel: [
    "relative z-10 min-w-0 -mx-screen w-[calc(100%+2*var(--screen-margin))] max-w-none overflow-hidden",
    "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  ].join(" "),
  swiper: [
    "!box-border !w-full min-w-0 overflow-hidden",
    "[&_.swiper-wrapper]:px-screen",
  ].join(" "),
  slide: "!box-border !h-auto",
};

/** Stable free-scroll options so rails do not re-init Swiper on parent render. */
export const discoveryHomeCarouselOptions = swiperFreeOptions({
  spaceBetween: DISCOVERY_HOME_CAROUSEL_GAP,
});

/**
 * Column-first chunks for a horizontal grid carousel
 * (3 rows → items 1–3 in column 1, 4–6 in column 2, …).
 */
export function chunkCarouselColumns<T>(
  items: readonly T[],
  rows: number,
): T[][] {
  if (rows < 1 || items.length === 0) return [];
  const columns: T[][] = [];
  for (let index = 0; index < items.length; index += rows) {
    columns.push(items.slice(index, index + rows));
  }
  return columns;
}

/**
 * Row-first chunks for a horizontal carousel
 * (2 columns → items 1–2 in slide 1, 3–4 in slide 2, …).
 */
export function chunkCarouselRows<T>(
  items: readonly T[],
  columns: number,
): T[][] {
  if (columns < 1 || items.length === 0) return [];
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += columns) {
    rows.push(items.slice(index, index + columns));
  }
  return rows;
}
