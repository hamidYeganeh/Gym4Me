import { describe, expect, it } from "@jest/globals";
import {
  chunkCarouselColumns,
  chunkCarouselRows,
  discoveryHomeCarouselClassNames,
} from "./discovery-home-carousel";

describe("discoveryHomeCarouselClassNames", () => {
  it("insets the swiper track with screen padding so skeletons match loaded rails", () => {
    expect(discoveryHomeCarouselClassNames.swiper).toContain(
      "[&_.swiper-wrapper]:px-screen",
    );
    expect(discoveryHomeCarouselClassNames.slide).toContain("!h-auto");
  });
});

describe("chunkCarouselColumns", () => {
  it("fills columns top-to-bottom for a 3-row grid", () => {
    expect(chunkCarouselColumns([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7],
    ]);
  });

  it("returns an empty list when there is nothing to chunk", () => {
    expect(chunkCarouselColumns([], 3)).toEqual([]);
    expect(chunkCarouselColumns([1, 2], 0)).toEqual([]);
  });
});

describe("chunkCarouselRows", () => {
  it("fills rows left-to-right for a 2-column carousel slide", () => {
    expect(chunkCarouselRows([1, 2, 3, 4, 5], 2)).toEqual([
      [1, 2],
      [3, 4],
      [5],
    ]);
  });

  it("returns an empty list when there is nothing to chunk", () => {
    expect(chunkCarouselRows([], 2)).toEqual([]);
    expect(chunkCarouselRows([1, 2], 0)).toEqual([]);
  });
});
