export {
  createBasicsLocationsApi,
  type BasicsLocationsApi,
} from "./locations.client";
export { basicsLocationsEndpoints } from "./locations.endpoint";
export type {
  LocationChildrenResponse,
  LocationNode,
  LocationRef,
} from "./locations.dto";
export { basicsLocationsKeys } from "./locations.keys";

export {
  createBasicsChoicesApi,
  type BasicsChoicesApi,
} from "./choices.client";
export { basicsChoicesEndpoints } from "./choices.endpoint";
export type { PublicChoiceGroup } from "./choices.dto";
export { basicsChoicesKeys, BASICS_CHOICES_STALE_TIME_MS } from "./choices.keys";

export {
  createBasicsSportsApi,
  type BasicsSportsApi,
} from "./sports.client";
export { basicsSportsEndpoints } from "./sports.endpoint";
export type {
  ListSportsQuery,
  SportChildrenResponse,
  SportNode,
  SportRef,
} from "./sports.dto";
export { basicsSportsKeys } from "./sports.keys";

export {
  createBasicsRefsApi,
  type BasicsRefsApi,
} from "./refs.client";
export { basicsRefsEndpoints } from "./refs.endpoint";
export type { BasicsRefListResponse } from "./refs.dto";
export { basicsRefsKeys } from "./refs.keys";
