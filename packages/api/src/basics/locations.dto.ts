import type { LocationNode, LocationRef, Paginated } from "../types";

export type LocationChildrenResponse = Paginated<LocationNode> & {
  parent: LocationNode;
};

export type { LocationNode, LocationRef };
