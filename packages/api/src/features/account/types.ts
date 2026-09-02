import type { AccessContext, ScopeType, TokenPair } from "../../core/contracts";

export type OtpPurpose =
  "LOGIN" | "REGISTER" | "PASSWORD_RESET" | "PHONE_CHANGE" | "SENSITIVE_ACTION";

export interface OtpRequestInput {
  mobile: string;
  purpose: OtpPurpose;
}

export interface OtpChallenge {
  challenge_id: string;
  expires_in: number;
  resend_after: number;
}

export interface OtpVerifyInput extends OtpRequestInput {
  code: string;
}

export interface PasswordLoginInput {
  mobile: string;
  password: string;
}

export interface AuthResult {
  user_id: string;
  tokens: TokenPair;
}

export interface PasswordRecoveryVerifyInput {
  mobile: string;
  code: string;
}

export interface PasswordRecoveryResetInput {
  reset_token: string;
  new_password: string;
}

export interface ProfilePatch {
  identity?: Record<string, unknown>;
  contact?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
  privacy?: Record<string, unknown>;
  custom_data?: Record<string, unknown>;
}

export interface ProfileResult {
  user: Record<string, unknown>;
  profile: Record<string, unknown> | null;
}

export interface AccessAssignment {
  assignment_id: string;
  role_id: string;
  role_code?: string;
  role_name?: string;
  scope_type: ScopeType;
  scope_id?: string;
  permissions: string[];
}

export interface AccessContextResult {
  assignments: AccessAssignment[];
  active_context: AccessContext | null;
}

export interface ActivateAccessContextInput {
  role_id: string;
  scope_type: ScopeType;
  scope_id?: string;
}

export interface ActivatedAccessContext {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  context: AccessContext;
}

export interface AuthSession {
  id: string;
  client: { ipAddress?: string; userAgent?: string; deviceId?: string };
  created_at: string;
  expires_at: string;
  status: "active";
  current: boolean;
}
