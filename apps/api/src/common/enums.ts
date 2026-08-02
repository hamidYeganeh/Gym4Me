export enum Role {
  ATHLETE = 'athlete',
  COACH = 'coach',
  CLUB_OWNER = 'club_owner',
  CLUB_STAFF = 'club_staff',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  DELETED = 'deleted',
}

export enum KycStatus {
  NONE = 'none',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum KycRequestKind {
  IDENTITY = 'identity',
  DOCUMENT = 'document',
}

export enum KycRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum OtpPurpose {
  AUTH = 'auth',
  PASSWORD_RESET = 'password_reset',
}

export enum InviteStatus {
  SENT = 'sent',
  JOINED = 'joined',
}

export enum LocationKind {
  COUNTRY = 'country',
  PROVINCE = 'province',
  CITY = 'city',
  DISTRICT = 'district',
}

export enum SportKind {
  CATEGORY = 'category',
  SPORT = 'sport',
  BRANCH = 'branch',
}

/** Whitelisted types for the generic RefItem collection. */
export enum RefType {
  EQUIPMENT = 'equipment',
  AMENITY = 'amenity',
  MUSCLE = 'muscle',
  GOAL_TYPE = 'goal_type',
  COACH_SPECIALTY = 'coach_specialty',
  CANCELLATION_REASON = 'cancellation_reason',
  DOCUMENT_TYPE = 'document_type',
  MEASUREMENT_UNIT = 'measurement_unit',
}

export enum RefStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
}

export enum AuditAction {
  USER_REGISTERED = 'user.registered',
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  PASSWORD_SET = 'user.password_set',
  PASSWORD_RESET = 'user.password_reset',
  INVITE_SENT = 'referral.invite_sent',
  REFERRAL_JOINED = 'referral.joined',
  KYC_IDENTITY_SUBMITTED = 'kyc.identity_submitted',
  KYC_DOCUMENT_SUBMITTED = 'kyc.document_submitted',
  KYC_REVIEWED = 'kyc.reviewed',
  ADMIN_USER_CREATED = 'admin.user_created',
  ADMIN_USER_UPDATED = 'admin.user_updated',
  ADMIN_USER_STATUS_CHANGED = 'admin.user_status_changed',
  ADMIN_USER_ROLES_CHANGED = 'admin.user_roles_changed',
  ADMIN_USER_DELETED = 'admin.user_deleted',
  MEDIA_UPLOADED = 'media.uploaded',
  CHOICE_CREATED = 'basics.choice_created',
  CHOICE_UPDATED = 'basics.choice_updated',
  CHOICE_DELETED = 'basics.choice_deleted',
  LOCATION_CREATED = 'basics.location_created',
  LOCATION_UPDATED = 'basics.location_updated',
  LOCATION_DELETED = 'basics.location_deleted',
  SPORT_CREATED = 'basics.sport_created',
  SPORT_UPDATED = 'basics.sport_updated',
  SPORT_DELETED = 'basics.sport_deleted',
  REF_CREATED = 'basics.ref_created',
  REF_UPDATED = 'basics.ref_updated',
  REF_DELETED = 'basics.ref_deleted',
}
