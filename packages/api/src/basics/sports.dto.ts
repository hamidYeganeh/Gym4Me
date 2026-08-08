import type { Paginated, SportNode } from "../types";

export type SportChildrenResponse = Paginated<SportNode> & {
  parent: SportNode;
};

export type ListSportsQuery = {
  parentId?: string;
};

export type { SportNode };
