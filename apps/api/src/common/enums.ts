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

/** Somatotype selected during athlete onboarding. */
export enum AthleteBodyType {
  ENDOMORPH = 'endomorph',
  ECTOMORPH = 'ectomorph',
  MESOMORPH = 'mesomorph',
}

/** Prior training background — enum, not a boolean. */
export enum AthleteExperience {
  BEGINNER = 'beginner',
  EXPERIENCED = 'experienced',
}

/** Self-reported baseline mood captured during onboarding. */
export enum AthleteMood {
  DEPRESSED = 'depressed',
  SAD = 'sad',
  NEUTRAL = 'neutral',
  HAPPY = 'happy',
  OVERJOYED = 'overjoyed',
}

/** Dietary preference captured during onboarding. */
export enum AthleteDiet {
  BALANCED = 'balanced',
  VEGETARIAN = 'vegetarian',
  PROTEIN = 'protein',
  GLUTEN_FREE = 'gluten_free',
}

export enum BloodGroup {
  A = 'A',
  B = 'B',
  AB = 'AB',
  O = 'O',
}

export enum RhFactor {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
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

/** Saved places on a user profile (home/work/gym are unique per user). */
export enum FavouriteLocationKind {
  HOME = 'home',
  WORK = 'work',
  GYM = 'gym',
  OTHER = 'other',
}

export enum SportKind {
  CATEGORY = 'category',
  SPORT = 'sport',
  BRANCH = 'branch',
}

/** Coaching focus areas. A coach profile may list several. */
export enum CoachType {
  BODYBUILDING = 'bodybuilding',
  STRENGTH_TRAINING = 'strength-training',
  WEIGHT_LOSS = 'weight-loss',
  FUNCTIONAL_TRAINING = 'functional-training',
  CROSSFIT = 'crossfit',
  CARDIO_ENDURANCE = 'cardio-endurance',
  GENERAL_FITNESS = 'general-fitness',
  CORRECTIVE_EXERCISE = 'corrective-exercise',
  SPORTS_REHABILITATION = 'sports-rehabilitation',
  YOGA = 'yoga',
  PILATES = 'pilates',
  MEDITATION_BREATHWORK = 'meditation-breathwork',
  FOOTBALL_FUTSAL = 'football-futsal',
  VOLLEYBALL = 'volleyball',
  BASKETBALL = 'basketball',
  RACKET_SPORTS = 'racket-sports',
  SWIMMING_AQUATICS = 'swimming-aquatics',
  BOXING_KICKBOXING = 'boxing-kickboxing',
  MARTIAL_ARTS = 'martial-arts',
  RUNNING = 'running',
  CYCLING = 'cycling',
  OUTDOOR_CONDITIONING = 'outdoor-conditioning',
  YOUTH_FITNESS = 'youth-fitness',
  SENIOR_FITNESS = 'senior-fitness',
  WOMENS_FITNESS = 'womens-fitness',
  PRENATAL_POSTNATAL = 'prenatal-postnatal',
  ADAPTIVE_FITNESS = 'adaptive-fitness',
  CONTEST_PREP = 'contest-prep',
  SPORTS_NUTRITION = 'sports-nutrition',
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
  SPACE = 'space',
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

/** Coach availability slot lifecycle. */
export enum CoachSlotStatus {
  OPEN = 'open',
  BOOKED = 'booked',
  BLOCKED = 'blocked',
}

/** Athlete ↔ coach booking lifecycle (locked product decision). */
export enum BookingStatus {
  PENDING = 'pending',
  AWAITING_PAYMENT = 'awaiting_payment',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  REFUND_REQUESTED = 'refund_requested',
  REFUNDED = 'refunded',
  REJECTED = 'rejected',
}

/** How a coaching session is delivered. */
export enum ConsultationKind {
  IN_PERSON = 'in_person',
  REMOTE = 'remote',
}

/**
 * What a booking reserves (locked product decision: independent
 * calendars/capacity for space, session, coach, class).
 */
export enum BookingResourceType {
  /** Athlete ↔ coach consultation on a CoachSlot. */
  COACH = 'coach',
  /** Club open session occurrence (ClubSlot kind=session). */
  SESSION = 'session',
  /** Group class occurrence (ClubSlot kind=class). */
  CLASS = 'class',
  /** Space / court / hall occurrence (ClubSlot kind=space). */
  SPACE = 'space',
}

export enum BookingActor {
  ATHLETE = 'athlete',
  COACH = 'coach',
  /** Club owner / staff acting for the venue. */
  CLUB = 'club',
  ADMIN = 'admin',
  /** Automated jobs (TTL expire, etc.). */
  SYSTEM = 'system',
}

export enum RulePolicy {
  ALLOWED = 'allowed',
  FORBIDDEN = 'forbidden',
}

export enum AchievementGrantMode {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
}

/** Entity kinds that can earn points and achievements. */
export enum GamificationSubjectType {
  ATHLETE = 'athlete',
  COACH = 'coach',
  CLUB = 'club',
}

/** Domain events the points engine can award on (admin picks one per rule). */
export enum PointRuleEvent {
  BOOKING_COMPLETED = 'booking_completed',
  ARTICLE_READ = 'article_read',
  ARTICLE_LIKED = 'article_liked',
  ARTICLE_COMMENTED = 'article_commented',
  CLUB_REVIEW_APPROVED = 'club_review_approved',
  REFERRAL_JOINED = 'referral_joined',
  PROFILE_COMPLETED = 'profile_completed',
}

/** How often the same rule may award the same subject. */
export enum PointRuleRepeat {
  /** Every matching event awards points (subject to dailyCap). */
  UNLIMITED = 'unlimited',
  /** Once per target entity (e.g. per article, per booking). */
  ONCE_PER_TARGET = 'once_per_target',
  /** At most once ever per subject. */
  ONCE = 'once',
}

export enum PointTransactionReason {
  RULE_AWARD = 'rule_award',
  ACHIEVEMENT_BONUS = 'achievement_bonus',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
  REDEMPTION = 'redemption',
  EXPIRY = 'expiry',
}

/** Metrics the automatic achievement engine can evaluate against a threshold. */
export enum AchievementMetric {
  LIFETIME_POINTS = 'lifetime_points',
  BOOKINGS_COUNT = 'bookings_count',
  ARTICLES_READ_COUNT = 'articles_read_count',
  ARTICLES_LIKED_COUNT = 'articles_liked_count',
  REVIEWS_COUNT = 'reviews_count',
  REVIEWS_AVERAGE = 'reviews_average',
  BRANCHES_COUNT = 'branches_count',
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
  ROLE_REQUEST_SUBMITTED = 'role_request_submitted',
  ROLE_REQUEST_REVIEWED = 'role_request_reviewed',
  KYC_IDENTITY_SUBMITTED = 'kyc_identity_submitted',
  KYC_DOCUMENT_SUBMITTED = 'kyc_document_submitted',
  REFERRAL_INVITE_SENT = 'referral_invite_sent',
  REFERRAL_QUALIFIED = 'referral_qualified',
  COACH_VERIFICATION_SUBMITTED = 'coach_verification_submitted',
  COACH_VERIFICATION_REVIEWED = 'coach_verification_reviewed',
  CLUB_DRAFT_CREATED = 'club_draft_created',
  CLUB_SUBMITTED_FOR_REVIEW = 'club_submitted_for_review',
  CLUB_REVIEWED = 'club_reviewed',
  ATTRIBUTION_CAPTURED = 'attribution_captured',
  BOOKING_COMPLETED = 'booking_completed',
  ARTICLE_READ = 'article_read',
  ARTICLE_LIKED = 'article_liked',
  POINTS_AWARDED = 'points_awarded',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  METRIC_LOGGED = 'metric_logged',
  WORKOUT_STARTED = 'workout_started',
  WORKOUT_COMPLETED = 'workout_completed',
  WORKOUT_ABANDONED = 'workout_abandoned',
  DATA_GRANT_CREATED = 'data_grant_created',
  DATA_GRANT_REVOKED = 'data_grant_revoked',
  FEATURE_EXPOSED = 'feature_exposed',
  HEALTH_SYNC_STARTED = 'health_sync_started',
  HEALTH_SYNC_COMPLETED = 'health_sync_completed',
  HEALTH_SYNC_FAILED = 'health_sync_failed',
  PROGRESS_EXPORTED = 'progress_exported',
  PROGRESS_METRICS_DELETED = 'progress_metrics_deleted',
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
  BOOKING_APPROVED_PAYMENT_REQUIRED = 'booking.approved_payment_required',
  BOOKING_REJECTED = 'booking.rejected',
  BOOKING_REMINDER = 'booking.reminder',
  BOOKING_CANCELLED_BY_PROVIDER = 'booking.cancelled_by_provider',
  BOOKING_RESCHEDULED = 'booking.rescheduled',
  WAITLIST_OFFER = 'waitlist.offer',
  MEMBERSHIP_EXPIRING = 'membership.expiring',
  LIFECYCLE_LOW_CREDITS = 'lifecycle.low_credits',
  LIFECYCLE_WIN_BACK = 'lifecycle.win_back',
  COACH_VERIFICATION_RESULT = 'coach.verification_result',
  ROLE_REQUEST_RESULT = 'role.request_result',
  PAYOUT_SETTLED = 'payout.settled',
  ACHIEVEMENT_UNLOCKED = 'gamification.achievement_unlocked',
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

/** Named app slot a promo banner renders in. */
export enum BannerPlacement {
  DISCOVERY_HOME = 'discovery_home',
  DISCOVERY_CLUBS = 'discovery_clubs',
  DISCOVERY_COACHES = 'discovery_coaches',
  ATHLETE_HOME = 'athlete_home',
  COACH_HOME = 'coach_home',
  OWNER_HOME = 'owner_home',
}

/** How a banner slide's link should be resolved by the client. */
export enum BannerLinkKind {
  NONE = 'none',
  INTERNAL = 'internal',
  EXTERNAL = 'external',
}

/** Nine-point overlay placement for banner title / action (RTL-safe). */
export enum BannerOverlayPlacement {
  TOP_START = 'top-start',
  TOP_CENTER = 'top-center',
  TOP_END = 'top-end',
  CENTER_START = 'center-start',
  CENTER = 'center',
  CENTER_END = 'center-end',
  BOTTOM_START = 'bottom-start',
  BOTTOM_CENTER = 'bottom-center',
  BOTTOM_END = 'bottom-end',
}

/** Banner image frame aspect ratio. */
export enum BannerAspectRatio {
  RATIO_16_9 = '16/9',
  RATIO_2_1 = '2/1',
  RATIO_4_3 = '4/3',
  RATIO_1_1 = '1/1',
}

/** Banner corner radius mapped to theme tokens. */
export enum BannerRadius {
  NONE = 'none',
  SM = 'sm',
  FIELD = 'field',
  COMPACT = 'compact',
  AUTH = 'auth',
  SURFACE = 'surface',
  FULL = 'full',
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
  OUTBOX_REPLAYED = 'outbox.replayed',
  APP_CONFIG_UPDATED = 'app_config.updated',
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
  ROLE_REQUEST_SUBMITTED = 'auth.role_request_submitted',
  ROLE_REQUEST_REVIEWED = 'auth.role_request_reviewed',
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
  PROFILE_SETTINGS_UPDATED = 'profile.settings_updated',
  PROFILE_FAVOURITE_LOCATION_CREATED = 'profile.favourite_location_created',
  PROFILE_FAVOURITE_LOCATION_UPDATED = 'profile.favourite_location_updated',
  PROFILE_FAVOURITE_LOCATION_DELETED = 'profile.favourite_location_deleted',
  CHOICE_CREATED = 'basics.choice_created',
  CHOICE_UPDATED = 'basics.choice_updated',
  CHOICE_DELETED = 'basics.choice_deleted',
  CHOICE_DEFAULTS_SEEDED = 'basics.choice_defaults_seeded',
  LOCATION_CREATED = 'basics.location_created',
  LOCATION_UPDATED = 'basics.location_updated',
  LOCATION_DELETED = 'basics.location_deleted',
  LOCATION_DEFAULTS_SEEDED = 'basics.location_defaults_seeded',
  SPORT_CREATED = 'basics.sport_created',
  SPORT_UPDATED = 'basics.sport_updated',
  SPORT_DELETED = 'basics.sport_deleted',
  SPORT_DEFAULTS_SEEDED = 'basics.sport_defaults_seeded',
  REF_CREATED = 'basics.ref_created',
  REF_UPDATED = 'basics.ref_updated',
  REF_DELETED = 'basics.ref_deleted',
  REF_DEFAULTS_SEEDED = 'basics.ref_defaults_seeded',
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
  BANNER_CREATED = 'banner.created',
  BANNER_UPDATED = 'banner.updated',
  BANNER_DELETED = 'banner.deleted',
  GAMIFICATION_ACHIEVEMENT_CREATED = 'gamification.achievement_created',
  GAMIFICATION_ACHIEVEMENT_UPDATED = 'gamification.achievement_updated',
  GAMIFICATION_ACHIEVEMENT_DELETED = 'gamification.achievement_deleted',
  GAMIFICATION_ACHIEVEMENT_DEFAULTS_SEEDED = 'gamification.achievement_defaults_seeded',
  GAMIFICATION_ACHIEVEMENT_GRANTED = 'gamification.achievement_granted',
  GAMIFICATION_ACHIEVEMENT_REVOKED = 'gamification.achievement_revoked',
  GAMIFICATION_POINT_RULE_CREATED = 'gamification.point_rule_created',
  GAMIFICATION_POINT_RULE_UPDATED = 'gamification.point_rule_updated',
  GAMIFICATION_POINT_RULE_DELETED = 'gamification.point_rule_deleted',
  GAMIFICATION_POINTS_ADJUSTED = 'gamification.points_adjusted',
  FINANCE_PAYMENT_RECORDED = 'finance.payment_recorded',
  FINANCE_LEDGER_POSTED = 'finance.ledger_posted',
  FINANCE_WALLET_TOPUP = 'finance.wallet_topup',
  FINANCE_SHIFT_CLOSED = 'finance.shift_closed',
  FINANCE_PAYOUT_CREATED = 'finance.payout_created',
  FINANCE_PAYOUT_SETTLED = 'finance.payout_settled',
  MEMBERSHIP_PLAN_CREATED = 'membership.plan_created',
  MEMBERSHIP_PLAN_UPDATED = 'membership.plan_updated',
  MEMBERSHIP_SOLD = 'membership.sold',
  MEMBERSHIP_FROZEN = 'membership.frozen',
  MEMBERSHIP_UNFROZEN = 'membership.unfrozen',
  MEMBERSHIP_TRANSFERRED = 'membership.transferred',
  MEMBERSHIP_CANCELLED = 'membership.cancelled',
  COACHING_SERVICE_UPSERTED = 'coaching.service_upserted',
  COACHING_AVAILABILITY_UPDATED = 'coaching.availability_updated',
  COACHING_PACKAGE_CREATED = 'coaching.package_created',
  COACHING_PACKAGE_CONSUMED = 'coaching.package_consumed',
  COACHING_LEAD_UPSERTED = 'coaching.lead_upserted',
  COACHING_STUDENT_LINKED = 'coaching.student_linked',
  STAFF_MEMBER_UPSERTED = 'staff.member_upserted',
  STAFF_MEMBER_REVOKED = 'staff.member_revoked',
  CHECKIN_RECORDED = 'checkin.recorded',
  WAITLIST_JOINED = 'waitlist.joined',
  WAITLIST_OFFERED = 'waitlist.offered',
  WAITLIST_CLAIMED = 'waitlist.claimed',
  CALENDAR_BLOCK_UPSERTED = 'calendar.block_upserted',
  HEALTH_ASSESSMENT_UPSERTED = 'health.assessment_upserted',
  EXERCISE_UPSERTED = 'progress.exercise_upserted',
  WORKOUT_PLAN_UPSERTED = 'workout.plan_upserted',
  WORKOUT_PROGRAM_UPSERTED = 'workout.program_upserted',
  METRIC_TYPE_UPSERTED = 'progress.metric_type_upserted',
  INVOICE_ISSUED = 'finance.invoice_issued',
  OWNER_TASK_UPSERTED = 'ops.owner_task_upserted',
  MEAL_PLAN_UPSERTED = 'nutrition.meal_plan_upserted',
  FOOD_ITEM_UPSERTED = 'nutrition.food_item_upserted',
  MEAL_ADHERENCE_LOGGED = 'nutrition.meal_adherence_logged',
  SOCIAL_POST_UPSERTED = 'social.post_upserted',
  SOCIAL_FOLLOW_CHANGED = 'social.follow_changed',
  SOCIAL_SAVE_TOGGLED = 'social.save_toggled',
  SOCIAL_REPORT_CREATED = 'social.report_created',
  SOCIAL_REPORT_RESOLVED = 'social.report_resolved',
  WORKOUT_LOG_UPSERTED = 'workout.log_upserted',
  PERSONAL_RECORD_UPSERTED = 'progress.personal_record_upserted',
  EXERCISE_SUBMITTED = 'progress.exercise_submitted',
  EXERCISE_VERIFIED = 'progress.exercise_verified',
  COACH_MESSAGE_SENT = 'coaching.message_sent',
  FINANCE_PAYOUT_DISPUTED = 'finance.payout_disputed',
  FINANCE_PAYOUT_DISPUTE_RESOLVED = 'finance.payout_dispute_resolved',
  ADMIN_IMPERSONATION_STARTED = 'admin.impersonation_started',
  ADMIN_IMPERSONATION_ENDED = 'admin.impersonation_ended',
  PROGRESS_EXPORTED = 'progress.exported',
  PROGRESS_METRIC_UPSERTED = 'progress.metric_upserted',
  PROGRESS_METRIC_SYNCED = 'progress.metric_synced',
  PROGRESS_METRIC_DELETED = 'progress.metric_deleted',
  PROGRESS_PHOTO_UPSERTED = 'progress.photo_upserted',
  PROGRESS_PHOTO_DELETED = 'progress.photo_deleted',
  PROGRESS_GOAL_UPSERTED = 'progress.goal_upserted',
  PROGRESS_REMINDER_UPSERTED = 'progress.reminder_upserted',
  PROGRESS_DATA_GRANT_CHANGED = 'progress.data_grant_changed',
  PROGRESS_HEALTH_SYNC_UPDATED = 'progress.health_sync_updated',
  PROGRESS_METRICS_BULK_DELETED = 'progress.metrics_bulk_deleted',
}

/** Staff permission keys (locked product decision). */
export enum StaffPermissionKey {
  BOOKINGS_CREATE = 'bookings.create',
  BOOKINGS_READ = 'bookings.read',
  BOOKINGS_CHECKIN = 'bookings.checkin',
  FINANCE_READ = 'finance.read',
  FINANCE_SETTLE = 'finance.settle',
  MEMBERS_CHECKIN = 'members.checkin',
  MEMBERS_MANAGE = 'members.manage',
  STAFF_MANAGE = 'staff.manage',
  SESSIONS_MANAGE = 'sessions.manage',
  REPORTS_READ = 'reports.read',
}

/** Named staff role presets — grants are still per-member. */
export enum StaffRolePreset {
  RECEPTION = 'reception',
  ACCOUNTANT = 'accountant',
  MANAGER = 'manager',
  CUSTOM = 'custom',
}

export enum ClubStaffStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REVOKED = 'revoked',
}

export enum PaymentChannel {
  ZARINPAL = 'zarinpal',
  CASH = 'cash',
  POS = 'pos',
  CARD_TO_CARD = 'card_to_card',
  WALLET = 'wallet',
  MIXED = 'mixed',
}

export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  CANCELLED = 'cancelled',
}

export enum PaymentPurpose {
  BOOKING = 'booking',
  MEMBERSHIP = 'membership',
  WALLET_TOPUP = 'wallet_topup',
  PACKAGE = 'package',
  PLATFORM_SUBSCRIPTION = 'platform_subscription',
  MANUAL = 'manual',
}

/** Double-entry ledger account kinds. */
export enum LedgerAccount {
  CASH = 'cash',
  POS = 'pos',
  GATEWAY_CLEARING = 'gateway_clearing',
  WALLET_LIABILITY = 'wallet_liability',
  PLATFORM_REVENUE = 'platform_revenue',
  PROVIDER_PAYABLE = 'provider_payable',
  TAX_PAYABLE = 'tax_payable',
  DISCOUNT_EXPENSE = 'discount_expense',
}

export enum LedgerEntryKind {
  PAYMENT = 'payment',
  REFUND = 'refund',
  PAYOUT = 'payout',
  ADJUSTMENT = 'adjustment',
  WALLET_TOPUP = 'wallet_topup',
  WALLET_SPEND = 'wallet_spend',
}

export enum WalletOwnerType {
  USER = 'user',
  CLUB = 'club',
  COACH = 'coach',
}

export enum MembershipPlanKind {
  DURATION = 'duration',
  SESSIONS = 'sessions',
  ENTRIES = 'entries',
}

export enum MembershipTransferPolicy {
  ALLOWED = 'allowed',
  FORBIDDEN = 'forbidden',
}

export enum MembershipStatus {
  ACTIVE = 'active',
  FROZEN = 'frozen',
  EXPIRED = 'expired',
  TRANSFERRED = 'transferred',
  CANCELLED = 'cancelled',
}

export enum MembershipEventType {
  SOLD = 'sold',
  RENEWED = 'renewed',
  FROZEN = 'frozen',
  UNFROZEN = 'unfrozen',
  TRANSFERRED = 'transferred',
  CANCELLED = 'cancelled',
  CREDIT_CONSUMED = 'credit_consumed',
  EXPIRED = 'expired',
}

/** Who performed a membership lifecycle mutation. */
export enum MembershipActorKind {
  OWNER = 'owner',
  STAFF = 'staff',
  ATHLETE = 'athlete',
  ADMIN = 'admin',
  SYSTEM = 'system',
}

export enum PlatformSubscriptionStatus {
  TRIALING = 'trialing',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

/** Nested renewal preference — not a boolean. */
export enum SubscriptionRenewalMode {
  AUTO = 'auto',
  MANUAL = 'manual',
}

export enum CoachAffiliationType {
  INDEPENDENT = 'independent',
  EMPLOYED = 'employed',
  REVENUE_SHARE = 'revenue_share',
}

export enum CoachServiceDeliveryMode {
  IN_PERSON = 'in_person',
  ONLINE = 'online',
  HOME = 'home',
}

export enum CoachServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum SessionPackageStatus {
  ACTIVE = 'active',
  FROZEN = 'frozen',
  EXHAUSTED = 'exhausted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum CoachLeadStage {
  NEW = 'new',
  CONTACTED = 'contacted',
  TRIAL = 'trial',
  CONVERTED = 'converted',
  LOST = 'lost',
}

export enum CoachStudentStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
}

/** Engagement health of a coach↔athlete relationship (orthogonal to status). */
export enum CoachStudentEngagementLevel {
  HEALTHY = 'healthy',
  AT_RISK = 'at_risk',
  QUIET = 'quiet',
}

export enum CalendarBlockReason {
  HOLIDAY = 'holiday',
  MAINTENANCE = 'maintenance',
  COACH_TIME_OFF = 'coach_time_off',
  SERVICE = 'service',
  OTHER = 'other',
}

export enum CalendarResourceType {
  CLUB = 'club',
  SPACE = 'space',
  SLOT = 'slot',
  COACH = 'coach',
  CLASS = 'class',
}

export enum CheckInMethod {
  QR = 'qr',
  BARCODE = 'barcode',
  MANUAL = 'manual',
}

export enum CheckInSyncMode {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

export enum WaitlistEntryStatus {
  WAITING = 'waiting',
  OFFERED = 'offered',
  CLAIMED = 'claimed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

/** Transactional outbox delivery lifecycle (R3). */
export enum OutboxMessageStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PUBLISHED = 'published',
  FAILED = 'failed',
  DEAD_LETTER = 'dead_letter',
}

/** Referral dual-reward lifecycle (R8–R9). */
export enum ReferralRewardStatus {
  PENDING = 'pending',
  QUALIFIED = 'qualified',
  CLAWED_BACK = 'clawed_back',
}

export enum ReferralQualifyTrigger {
  PAYMENT = 'payment',
  CHECKIN = 'checkin',
}

export enum DebtStatus {
  OPEN = 'open',
  PARTIAL = 'partial',
  SETTLED = 'settled',
  WRITTEN_OFF = 'written_off',
}

export enum InstallmentStatus {
  SCHEDULED = 'scheduled',
  DUE = 'due',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export enum CashShiftStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export enum PayoutStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SETTLED = 'settled',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

export enum PayoutRecipientType {
  CLUB = 'club',
  COACH = 'coach',
}

export enum CompensationBasis {
  PER_SESSION = 'per_session',
  ATTENDANCE = 'attendance',
  REVENUE_PERCENT = 'revenue_percent',
  FIXED = 'fixed',
}

export enum SpaceAvailability {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  RETIRED = 'retired',
}

export enum HealthAssessmentStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  REVIEWED = 'reviewed',
}

export enum WorkoutPlanStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum MealPlanStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export enum SocialPostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  HIDDEN = 'hidden',
  DELETED = 'deleted',
}

export enum ExerciseStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

/** Who authored an exercise in the bank. */
export enum ExerciseOriginKind {
  SYSTEM = 'system',
  ADMIN = 'admin',
  COACH = 'coach',
}

/** Catalog value shape for MetricType (H6). */
export enum MetricValueKind {
  NUMBER = 'number',
  PAIR = 'pair',
  RANGE = 'range',
  RATIO = 'ratio',
  TEXT = 'text',
}

export enum MetricTypeStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

/** How samples for a MetricType roll up in summaries. */
export enum MetricAggregation {
  LATEST = 'latest',
  SUM = 'sum',
  AVERAGE = 'average',
  MIN = 'min',
  MAX = 'max',
}

/** Temporal shape of a ProgressMetric sample. */
export enum MetricPeriodKind {
  POINT = 'point',
  INTERVAL = 'interval',
  DAILY_TOTAL = 'daily-total',
}

/** Sensitivity class for grant / privacy policy. */
export enum MetricPrivacyClass {
  WELLNESS = 'wellness',
  HEALTH = 'health',
  SENSITIVE = 'sensitive',
}

/** Origin of a ProgressMetric row; sourceRecordId de-duplicates device sync. */
export enum MetricSource {
  MANUAL = 'manual',
  APPLE_HEALTH = 'apple_health',
  HEALTH_CONNECT = 'health_connect',
  IMPORT = 'import',
}

export enum MetricGoalPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  ROLLING_7D = 'rolling_7d',
}

export enum MetricGoalStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum MetricGoalOperator {
  GTE = 'gte',
  LTE = 'lte',
  EQ = 'eq',
}

export enum MetricReminderStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

export enum MetricReminderChannel {
  PUSH = 'push',
  IN_APP = 'in_app',
}

export enum AthleteDataGrantStatus {
  ACTIVE = 'active',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
}

export enum AthleteDataGranteeType {
  COACH = 'coach',
}

/** Grant scopes — coach access requires CoachStudent + matching active scope. */
export enum AthleteDataGrantScope {
  METRICS_WEIGHT = 'metrics.weight',
  METRICS_SLEEP = 'metrics.sleep',
  METRICS_STEPS = 'metrics.steps',
  METRICS_WATER = 'metrics.water',
  METRICS_WALKING = 'metrics.walking',
  METRICS_ALL = 'metrics.*',
  WORKOUTS_LOGS = 'workouts.logs',
  PROGRESS_PHOTOS = 'progress.photos',
  PROGRESS_PERSONAL_RECORDS = 'progress.personal_records',
}

export enum HealthSyncProvider {
  APPLE_HEALTH = 'apple_health',
  HEALTH_CONNECT = 'health_connect',
}

export enum HealthSyncStatus {
  CONNECTED = 'connected',
  PAUSED = 'paused',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

/** Reusable coach/admin workout program template (distinct from assigned WorkoutPlan). */
export enum WorkoutProgramStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum WorkoutProgramOwnerType {
  COACH = 'coach',
  ADMIN = 'admin',
  SYSTEM = 'system',
}

export enum InvoiceStatus {
  ISSUED = 'issued',
  VOID = 'void',
}

export enum OwnerTaskStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export enum OwnerTaskPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}

/** Analytics dashboard period for owner/coach KPI overviews. */
export enum AnalyticsPeriod {
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
}

/** Athlete workout session log lifecycle. */
export enum WorkoutLogStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  ABANDONED = 'abandoned',
}

/** Payout dispute lifecycle (never mutate past ledger — reverse only). */
export enum PayoutDisputeStatus {
  OPEN = 'open',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

/** Admin impersonation session lifecycle. */
export enum ImpersonationSessionStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
}

/** Social follow target kind. */
export enum SocialFolloweeKind {
  USER = 'user',
  CLUB = 'club',
}

/** Social report moderation. */
export enum SocialReportStatus {
  OPEN = 'open',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

export enum SocialReportTargetKind {
  POST = 'post',
  COMMENT = 'comment',
  USER = 'user',
}

/** Food bank item lifecycle. */
export enum FoodItemStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

/** Meal plan adherence for a planned meal slot. */
export enum MealAdherenceStatus {
  FOLLOWED = 'followed',
  PARTIAL = 'partial',
  SKIPPED = 'skipped',
  SUBSTITUTED = 'substituted',
}
