import type { BannerPlacement } from "../types";

export const bannersKeys = {
  all: ["banners"] as const,
  lists: () => [...bannersKeys.all, "list"] as const,
  list: (placement: BannerPlacement) =>
    [...bannersKeys.lists(), placement] as const,
};
