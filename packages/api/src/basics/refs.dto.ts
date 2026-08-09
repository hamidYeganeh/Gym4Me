import type { Paginated, RefItem, RefType } from "../types";

export type BasicsRefListResponse = Paginated<RefItem> & {
  type: RefType;
};
