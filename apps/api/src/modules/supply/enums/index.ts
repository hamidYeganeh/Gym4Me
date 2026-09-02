export const RESOURCE_STATUSES = ["draft", "active", "maintenance", "archived"] as const;
export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];
export const RESOURCE_CREATE_STATUSES = ["draft", "active", "maintenance"] as const;

export const CAPACITY_MODES = ["exclusive", "shared"] as const;
export type CapacityMode = (typeof CAPACITY_MODES)[number];

export const OFFERING_TYPES = [
  "resource_rental",
  "club_session",
  "group_class",
  "private_coaching",
  "online_session",
  "other",
] as const;
export type OfferingType = (typeof OFFERING_TYPES)[number];

export const PRICING_MODES = ["per_booking", "per_person", "per_hour"] as const;
export type PricingMode = (typeof PRICING_MODES)[number];

export const REQUIREMENT_MODES = ["required", "optional"] as const;
export type RequirementMode = (typeof REQUIREMENT_MODES)[number];

export const AVAILABILITY_EXCEPTION_TYPES = [
  "closed",
  "capacity_override",
  "special_opening",
] as const;
export type AvailabilityExceptionType = (typeof AVAILABILITY_EXCEPTION_TYPES)[number];

export const OFFERING_STATUSES = ["draft", "active", "suspended", "archived"] as const;
export type OfferingStatus = (typeof OFFERING_STATUSES)[number];
export const OFFERING_CREATE_STATUSES = ["draft", "active"] as const;

export const LIFECYCLE_STATUSES = [
  "draft",
  "active",
  "maintenance",
  "suspended",
  "archived",
] as const;
export type LifecycleStatus = (typeof LIFECYCLE_STATUSES)[number];
