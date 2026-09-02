export type Identifier = string;

export type LifecycleStatus =
  | "draft"
  | "pending"
  | "pending_verification"
  | "active"
  | "verified"
  | "suspended"
  | "blocked"
  | "rejected"
  | "archived";

export interface StatusValue {
  code: string;
  label?: string;
}

export interface AuditValue {
  created_at: string;
  created_by?: Identifier;
  updated_at: string;
  updated_by?: Identifier;
  version: number;
}

export interface ApiMeta {
  request_id: string;
  timestamp: string;
  next_cursor?: string;
  has_more?: boolean;
}

export interface ApiSuccess<T> {
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorShape {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    request_id: string;
  };
}

export type ScopeType = "global" | "self" | "organization" | "branch";
export type PersonaCode = "athlete" | "coach" | "club_staff" | "admin";

export interface AccessScope {
  type: ScopeType;
  id?: Identifier;
}

export interface AccessContext {
  persona: PersonaCode;
  role_id?: Identifier;
  scope: AccessScope;
}

export interface AccessTokenClaims {
  sub: Identifier;
  session_id: Identifier;
  token_type: "access";
  context?: AccessContext;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
}

export type DynamicFieldType =
  | "text"
  | "long_text"
  | "integer"
  | "decimal"
  | "money"
  | "boolean"
  | "date"
  | "datetime"
  | "single_select"
  | "multi_select"
  | "phone"
  | "email"
  | "url"
  | "location"
  | "file"
  | "image"
  | "gallery"
  | "relation"
  | "object"
  | "object_list";

export interface DynamicFieldDefinition {
  id: Identifier;
  key: string;
  group_key?: string;
  label: Record<string, string>;
  description?: Record<string, string>;
  data_type: DynamicFieldType;
  required: boolean;
  default_value?: unknown;
  validation: Record<string, unknown>;
  visibility: Record<string, unknown>;
  display: Record<string, unknown>;
  status: StatusValue;
}

export interface EntitySchemaContract {
  entity_type: string;
  version: number;
  fields: DynamicFieldDefinition[];
}

export interface MoneyValue {
  amount_minor: string;
  currency: string;
}

export interface PhoneValue {
  value: string;
  verified_at?: string;
}

export interface ContactValue {
  mobile: PhoneValue;
  email?: {
    value: string;
    verified_at?: string;
  };
}
