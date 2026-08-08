export {
  createBasicsLocationsApi,
  type BasicsLocationsApi,
} from "./locations.client";
export { basicsLocationsEndpoints } from "./locations.endpoint";
export type { LocationChildrenResponse, LocationNode } from "./locations.dto";
export { basicsLocationsKeys } from "./locations.keys";

export {
  createBasicsSportsApi,
  type BasicsSportsApi,
} from "./sports.client";
export { basicsSportsEndpoints } from "./sports.endpoint";
export type {
  ListSportsQuery,
  SportChildrenResponse,
  SportNode,
} from "./sports.dto";
export { basicsSportsKeys } from "./sports.keys";
