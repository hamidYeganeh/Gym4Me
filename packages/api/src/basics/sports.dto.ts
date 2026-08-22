import type { Paginated, SportNode, SportRef } from "../types";

export type SportChildrenResponse = Paginated<SportNode> & {
  parent: SportNode;
};

export type ListSportsQuery = {
  parentId?: string;
};

export type { SportNode, SportRef };
