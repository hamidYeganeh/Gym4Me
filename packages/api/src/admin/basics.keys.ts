import type { RefType } from "../types";
import type {
  ListAdminLocationsQuery,
  ListAdminSportsQuery,
} from "./basics.dto";

export const adminBasicsKeys = {
  all: ["admin", "basics"] as const,
  choices: () => [...adminBasicsKeys.all, "choices"] as const,
  locations: () => [...adminBasicsKeys.all, "locations"] as const,
  locationList: (query: ListAdminLocationsQuery) =>
    [...adminBasicsKeys.locations(), "list", query] as const,
  locationDetail: (id: string) =>
    [...adminBasicsKeys.locations(), "detail", id] as const,
  sports: () => [...adminBasicsKeys.all, "sports"] as const,
  sportList: (query: ListAdminSportsQuery = {}) =>
    [...adminBasicsKeys.sports(), "list", query] as const,
  sportDetail: (id: string) =>
    [...adminBasicsKeys.sports(), "detail", id] as const,
  refs: () => [...adminBasicsKeys.all, "refs"] as const,
  refList: (type: RefType) => [...adminBasicsKeys.refs(), "list", type] as const,
  refDetail: (type: RefType, id: string) =>
    [...adminBasicsKeys.refs(), "detail", type, id] as const,
};
