export {
  createAccountProfileApi,
  type AccountProfileApi,
} from "./profile.client";
export { accountProfileEndpoints } from "./profile.endpoint";
export type {
  AthleteProfile,
  CoachProfile,
  SubmitCoachVerificationInput,
  UpdateAthleteProfileInput,
  UpdateCoachProfileInput,
  UpdateMeInput,
} from "./profile.dto";
export { accountProfileKeys } from "./profile.keys";

export {
  createAccountKycApi,
  type AccountKycApi,
} from "./kyc.client";
export { accountKycEndpoints } from "./kyc.endpoint";
export type {
  KycDocumentRequest,
  KycStatusResponse,
  SubmitIdentityInput,
} from "./kyc.dto";
export { accountKycKeys } from "./kyc.keys";

export {
  createAccountRolesApi,
  type AccountRolesApi,
} from "./roles.client";
export { accountRolesEndpoints } from "./roles.endpoint";
export type { ApplyRoleInput, ApplyRoleResponse } from "./roles.dto";
export { accountRolesKeys } from "./roles.keys";

export {
  createAccountReferralApi,
  type AccountReferralApi,
} from "./referral.client";
export { accountReferralEndpoints } from "./referral.endpoint";
export type {
  InviteInput,
  InviteResponse,
  MyReferralResponse,
  ReferralInvite,
  ValidateReferralResponse,
} from "./referral.dto";
export { accountReferralKeys } from "./referral.keys";

export {
  createAccountClubsApi,
  createClubOwnerClubsApi,
  type AccountClubsApi,
  type ClubOwnerClubsApi,
} from "./clubs.client";
export { accountClubsEndpoints } from "./clubs.endpoint";
export type {
  AdminCreateClubInput,
  Club,
  ClubLocationNode,
  ClubOperationalStatus,
  ClubRefItem,
  ClubSportItem,
  ClubUserReview,
  CreateClubInput,
  GeoDirection,
  RulePolicy,
  SubmitClubReviewInput,
  UpdateClubInput,
  OperatingHourAudience,
  WeekdayStatus,
} from "./clubs.dto";
export { accountClubsKeys } from "./clubs.keys";

export {
  createAccountClubSlotsApi,
  createClubOwnerClubSlotsApi,
  type AccountClubSlotsApi,
  type ClubOwnerClubSlotsApi,
} from "./club-slots.client";
export { accountClubSlotsEndpoints } from "./club-slots.endpoint";
export type {
  CancelSlotOccurrenceInput,
  ClubClass,
  ClubClassMedia,
  ClubClassesList,
  ClubSlot,
  ClubSlotsList,
  CreateClubClassInput,
  CreateClubSlotInput,
  EntityStatus,
  OccurrenceStatus,
  SlotException,
  SlotExceptionStatus,
  SlotKind,
  SlotRecurrence,
  SlotRecurrenceType,
  SlotSchedule,
  UpdateClubClassInput,
  UpdateClubSlotInput,
} from "./club-slots.dto";
export { accountClubSlotsKeys } from "./club-slots.keys";

export {
  createAccountSupportApi,
  type AccountSupportApi,
} from "./support.client";
export { accountSupportEndpoints } from "./support.endpoint";
export type {
  CreateSupportTicketInput,
  ListMySupportTicketsQuery,
  ListPublicFaqQuery,
  PublicFaqItem,
  ReplySupportTicketInput,
  SupportContact,
  SupportRelatedEntity,
  SupportTicket,
  SupportTicketDetail,
  SupportTicketMessage,
  SupportUserSummary,
} from "./support.dto";
export { accountSupportKeys } from "./support.keys";

export {
  createAccountNotificationsApi,
  type AccountNotificationsApi,
} from "./notifications.client";
export { accountNotificationsEndpoints } from "./notifications.endpoint";
export type {
  ListNotificationsQuery,
  NotificationInbox,
  NotificationItem,
  RegisterDeviceInput,
  RegisterDeviceResult,
} from "./notifications.dto";
export { accountNotificationsKeys } from "./notifications.keys";
