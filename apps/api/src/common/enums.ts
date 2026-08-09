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

/** Generic lifecycle for catalog / taxonomy entities. */
export enum EntityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum VerificationStatus {
  UNSUBMITTED = 'unsubmitted',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum Privacy {
  PUBLIC = 'public',
  FOLLOWERS = 'followers',
  COACH_ONLY = 'coach_only',
  PRIVATE = 'private',
}

export enum ClubLifecycleStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
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
  /** Admin panel login — must never share Redis keys with account AUTH. */
  ADMIN_AUTH = 'admin_auth',
  PASSWORD_RESET = 'password_reset',
}

/** Roles that account (mobile) sessions may switch into. Admin is admin-auth only. */
export enum SelfSwitchableRole {
  ATHLETE = 'athlete',
  COACH = 'coach',
  CLUB_OWNER = 'club_owner',
}

/** Media readability for public vs authenticated/owner reads. */
export enum MediaVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
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
  /** Club categories: pool, gym, football pitch, multi-sport, … */
  CLUB_CATEGORY = 'club_category',
  /** Admin-defined review rating dimensions: cleanliness, value, … */
  REVIEW_CRITERION = 'review_criterion',
}

/** Operational on/off for a club (separate from admin lifecycle approval). */
export enum ClubOperationalStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

/** User-authored club reviews (discovery UI). */
export enum ClubUserReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  HIDDEN = 'hidden',
}

export enum WeekdayStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

/**
 * Who an operating-hours row applies to.
 * `shared` = same hours for all (or single-gender clubs).
 * `male` / `female` = gender-split schedule (typical for mixed clubs).
 */
export enum OperatingHourAudience {
  SHARED = 'shared',
  MALE = 'male',
  FEMALE = 'female',
}

/** Club calendar slot resource kind. */
export enum SlotKind {
  CLASS = 'class',
  SESSION = 'session',
}

export enum SlotRecurrenceType {
  WEEKLY = 'weekly',
  ONCE = 'once',
}

export enum SlotExceptionStatus {
  CANCELLED = 'cancelled',
}

export enum OccurrenceStatus {
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
}

export enum RulePolicy {
  ALLOWED = 'allowed',
  FORBIDDEN = 'forbidden',
}

export enum AchievementGrantMode {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
}

/** Rough city-area orientation for club location filters. */
export enum GeoDirection {
  NORTH = 'north',
  SOUTH = 'south',
  EAST = 'east',
  WEST = 'west',
  CENTER = 'center',
}

export enum RefStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
}

/** Server-side product analytics event names (Phase 1 subset). */
export enum AnalyticsEventName {
  USER_REGISTERED = 'user_registered',
  USER_LOGIN = 'user_login',
  PROFILE_COMPLETED = 'profile_completed',
  ROLE_SWITCHED = 'role_switched',
  ROLE_APPLIED = 'role_applied',
  KYC_IDENTITY_SUBMITTED = 'kyc_identity_submitted',
  KYC_DOCUMENT_SUBMITTED = 'kyc_document_submitted',
  REFERRAL_INVITE_SENT = 'referral_invite_sent',
  COACH_VERIFICATION_SUBMITTED = 'coach_verification_submitted',
  COACH_VERIFICATION_REVIEWED = 'coach_verification_reviewed',
  CLUB_DRAFT_CREATED = 'club_draft_created',
  CLUB_SUBMITTED_FOR_REVIEW = 'club_submitted_for_review',
  CLUB_REVIEWED = 'club_reviewed',
  ATTRIBUTION_CAPTURED = 'attribution_captured',
}

/** Lifecycle of a mock-gateway payment session (dev/test only). */
export enum MockPaymentStatus {
  CREATED = 'created',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  VERIFIED = 'verified',
}

/**
 * Deterministic mock-gateway behavior derived from the amount's last digit:
 * `…1` → auto-cancel at checkout, `…2` → verify always fails.
 */
export enum MockPaymentOutcomeRule {
  INTERACTIVE = 'interactive',
  AUTO_CANCEL = 'auto_cancel',
  VERIFY_FAIL = 'verify_fail',
}

export enum NotificationReadStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
}

export enum NotificationChannelSetting {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
}

/** SMS behavior per template: never, only as fallback for critical sends, or always. */
export enum NotificationSmsSetting {
  DISABLED = 'disabled',
  CRITICAL_FALLBACK = 'critical_fallback',
  ALWAYS = 'always',
}

export enum NotificationDeliveryStatus {
  SENT = 'sent',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export enum DevicePlatform {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web',
}

export enum DeviceTokenStatus {
  ACTIVE = 'active',
  REVOKED = 'revoked',
}

/** Transactional notification templates shipped with the platform. */
export enum NotificationTemplateKey {
  PAYMENT_SUCCEEDED = 'payment.succeeded',
  PAYMENT_FAILED = 'payment.failed',
  BOOKING_CONFIRMED = 'booking.confirmed',
  BOOKING_REJECTED = 'booking.rejected',
  BOOKING_REMINDER = 'booking.reminder',
  BOOKING_CANCELLED_BY_PROVIDER = 'booking.cancelled_by_provider',
  WAITLIST_OFFER = 'waitlist.offer',
  MEMBERSHIP_EXPIRING = 'membership.expiring',
  COACH_VERIFICATION_RESULT = 'coach.verification_result',
  PAYOUT_SETTLED = 'payout.settled',
}

export enum SupportTicketCategory {
  PAYMENT = 'payment',
  BOOKING = 'booking',
  MEMBERSHIP = 'membership',
  TECHNICAL = 'technical',
  CLUB_COMPLAINT = 'club_complaint',
  SUGGESTION = 'suggestion',
  COMPLAINT = 'complaint',
  OTHER = 'other',
}

export enum SupportTicketPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum SupportTicketStatus {
  OPEN = 'open',
  AWAITING_ADMIN = 'awaiting_admin',
  AWAITING_USER = 'awaiting_user',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum SupportMessageAuthorKind {
  REQUESTER = 'requester',
  ADMIN = 'admin',
}

/** Soft reference targets for support tickets / disputes. */
export enum SupportRelatedEntityKind {
  BOOKING = 'booking',
  PAYMENT = 'payment',
  CLUB = 'club',
  MEMBERSHIP = 'membership',
}

export enum FaqAudience {
  ALL = 'all',
  ATHLETE = 'athlete',
  COACH = 'coach',
  CLUB_OWNER = 'club_owner',
}

export enum PublishStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
}

/** Editorial format / type of an article. */
export enum ArticleKind {
  GUIDE = 'guide',
  NEWS = 'news',
  TIP = 'tip',
  STORY = 'story',
  WORKOUT = 'workout',
}

/** Who the article is primarily written for. */
export enum ArticleAudience {
  ALL = 'all',
  ATHLETE = 'athlete',
  COACH = 'coach',
  CLUB_OWNER = 'club_owner',
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
  ROLE_SWITCHED = 'auth.role_switched',
  ROLE_APPLIED = 'auth.role_applied',
  COACH_VERIFICATION_SUBMITTED = 'coach.verification_submitted',
  COACH_VERIFICATION_REVIEWED = 'coach.verification_reviewed',
  CLUB_CREATED = 'club.created',
  CLUB_UPDATED = 'club.updated',
  CLUB_DELETED = 'club.deleted',
  CLUB_SUBMITTED = 'club.submitted',
  CLUB_REVIEWED = 'club.reviewed',
  CLUB_ACTIVATED = 'club.activated',
  CLUB_DEACTIVATED = 'club.deactivated',
  CLUB_USER_REVIEW_CREATED = 'club.user_review_created',
  CLUB_USER_REVIEW_MODERATED = 'club.user_review_moderated',
  ACHIEVEMENT_GRANTED = 'club.achievement_granted',
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
  SUPPORT_TICKET_CREATED = 'support.ticket_created',
  SUPPORT_TICKET_REPLIED = 'support.ticket_replied',
  SUPPORT_TICKET_UPDATED = 'support.ticket_updated',
  SUPPORT_TICKET_CLOSED = 'support.ticket_closed',
  SUPPORT_FAQ_CREATED = 'support.faq_created',
  SUPPORT_FAQ_UPDATED = 'support.faq_updated',
  SUPPORT_FAQ_DELETED = 'support.faq_deleted',
  ARTICLE_CREATED = 'article.created',
  ARTICLE_UPDATED = 'article.updated',
  ARTICLE_DELETED = 'article.deleted',
  ARTICLE_LIKED = 'article.liked',
  ARTICLE_UNLIKED = 'article.unliked',
  ARTICLE_SAVED = 'article.saved',
  ARTICLE_UNSAVED = 'article.unsaved',
  ARTICLE_COMMENT_CREATED = 'article.comment_created',
}
