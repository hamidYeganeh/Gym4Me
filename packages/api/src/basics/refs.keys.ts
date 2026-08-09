import type { RefType } from "../types";

export const basicsRefsKeys = {
  all: ["basics", "refs"] as const,
  list: (type: RefType) => [...basicsRefsKeys.all, "list", type] as const,
  detail: (type: RefType, id: string) =>
    [...basicsRefsKeys.all, "detail", type, id] as const,
};
