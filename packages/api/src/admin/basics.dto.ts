import type {
  GeoCoordinates,
  LocationKind,
  Paginated,
  RefItem,
  RefStatus,
  RefType,
  SportKind,
} from "../types";

export type ListAdminLocationsQuery = {
  kind: LocationKind;
  parentId?: string;
};

export type ListAdminSportsQuery = {
  kind?: SportKind;
  parentId?: string;
};

export type AdminChoiceOptionInput = {
  value: string;
  name: string;
  description?: string;
  order?: number;
  isActive?: boolean;
};

export type AdminCreateChoiceGroupInput = {
  key: string;
  name: string;
  description?: string;
  isSystem?: boolean;
  options: AdminChoiceOptionInput[];
  isActive?: boolean;
};

export type AdminUpdateChoiceGroupInput = {
  name?: string;
  description?: string;
  options?: AdminChoiceOptionInput[];
  isActive?: boolean;
};

export type SeedChoiceDefaultsResult = {
  created: string[];
  updated: string[];
  skipped: string[];
};

/** Shared result shape for basics / gamification Import defaults. */
export type SeedDefaultsResult = SeedChoiceDefaultsResult;

export type AdminCreateLocationInput = {
  kind: LocationKind;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  flagSvg?: string;
  parentId?: string;
  center?: GeoCoordinates;
  coverMediaId?: string;
  order?: number;
  isActive?: boolean;
};

export type AdminUpdateLocationInput = {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string | null;
  flagSvg?: string | null;
  center?: GeoCoordinates | null;
  coverMediaId?: string | null;
  order?: number;
  isActive?: boolean;
};

export type AdminCreateSportInput = {
  kind: SportKind;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  coverMediaId?: string;
  parentId?: string;
  order?: number;
  isActive?: boolean;
};

export type AdminUpdateSportInput = {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string | null;
  coverMediaId?: string | null;
  order?: number;
  isActive?: boolean;
};

export type AdminCreateRefItemInput = {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  coverMediaId?: string;
  order?: number;
  status?: RefStatus;
  isActive?: boolean;
};

export type AdminUpdateRefItemInput = {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string | null;
  coverMediaId?: string | null;
  order?: number;
  status?: RefStatus;
  isActive?: boolean;
};

export type AdminRefListResponse = Paginated<RefItem> & {
  type: RefType;
};
