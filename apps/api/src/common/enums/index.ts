export const SCOPE_TYPES = ["global", "self", "organization", "branch"] as const;
export type ScopeType = (typeof SCOPE_TYPES)[number];

export const PERSONA_CODES = ["athlete", "coach", "club_staff", "admin"] as const;
export type PersonaCode = (typeof PERSONA_CODES)[number];

export const GENDER_POLICIES = ["all", "women", "men", "scheduled"] as const;
export type GenderPolicy = (typeof GENDER_POLICIES)[number];

export const RECORD_STATUSES = ["active", "inactive", "archived"] as const;
export type RecordStatus = (typeof RECORD_STATUSES)[number];

export const DRAFT_ACTIVE_STATUSES = ["draft", "active"] as const;
export type DraftActiveStatus = (typeof DRAFT_ACTIVE_STATUSES)[number];

export const ACTIVE_INACTIVE_STATUSES = ["active", "inactive"] as const;
export type ActiveInactiveStatus = (typeof ACTIVE_INACTIVE_STATUSES)[number];

export const CALCULATION_TYPES = ["percentage", "fixed"] as const;
export type CalculationType = (typeof CALCULATION_TYPES)[number];

export const PROVIDER_TYPES = ["organization", "coach"] as const;
export type ProviderType = (typeof PROVIDER_TYPES)[number];

export const SERVICE_MODES = ["in_person", "online", "hybrid"] as const;
export type ServiceMode = (typeof SERVICE_MODES)[number];

export const VERIFICATION_DECISIONS = ["verified", "rejected", "needs_correction"] as const;
export type VerificationDecision = (typeof VERIFICATION_DECISIONS)[number];
