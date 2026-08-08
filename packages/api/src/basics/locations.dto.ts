import type { LocationNode, Paginated } from "../types";

export type LocationChildrenResponse = Paginated<LocationNode> & {
  parent: LocationNode;
};

export type { LocationNode };
