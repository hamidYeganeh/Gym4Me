export {
  createAdminUsersApi,
  type AdminUsersApi,
} from "./users.client";
export { adminUsersEndpoints } from "./users.endpoint";
export type {
  AdminCreateUserInput,
  AdminUpdateUserInput,
  AdminUpdateUserRolesInput,
  AdminUpdateUserStatusInput,
  AdminUserActivationInput,
  ListAdminUsersQuery,
} from "./users.dto";
export { adminUsersKeys } from "./users.keys";

export {
  createAdminBasicsApi,
  type AdminBasicsApi,
} from "./basics.client";
export { adminBasicsEndpoints } from "./basics.endpoint";
export type {
  AdminChoiceOptionInput,
  AdminCreateChoiceGroupInput,
  AdminCreateLocationInput,
  AdminCreateRefItemInput,
  AdminCreateSportInput,
  AdminRefListResponse,
  AdminUpdateChoiceGroupInput,
  AdminUpdateLocationInput,
  AdminUpdateRefItemInput,
  AdminUpdateSportInput,
  ListAdminLocationsQuery,
  ListAdminSportsQuery,
} from "./basics.dto";
export { adminBasicsKeys } from "./basics.keys";

export {
  createAdminKycApi,
  type AdminKycApi,
} from "./kyc.client";
export { adminKycEndpoints } from "./kyc.endpoint";
export type {
  AdminKycRequest,
  AdminKycUserSummary,
  ListAdminKycQuery,
  ReviewKycInput,
} from "./kyc.dto";
export { adminKycKeys } from "./kyc.keys";

export {
  createAdminVerificationApi,
  type AdminVerificationApi,
} from "./verification.client";
export { adminVerificationEndpoints } from "./verification.endpoint";
export type {
  CoachVerificationItem,
  CoachVerificationUser,
  ListClubReviewsQuery,
  ListCoachVerificationsQuery,
  ReviewCoachResponse,
  ReviewVerificationInput,
} from "./verification.dto";
export { adminVerificationKeys } from "./verification.keys";

export {
  createAdminClubsApi,
  type AdminClubsApi,
} from "./clubs.client";
export { adminClubsEndpoints } from "./clubs.endpoint";
export type {
  AdminClubReviewsQuery,
  AdminClubsListQuery,
  AdminCreateBranchInput,
  AdminCreateClubInput,
  Club,
  ClubUserReview,
  CreateClubInput,
  UpdateClubInput,
} from "./clubs.dto";
export { adminClubsKeys } from "./clubs.keys";

export {
  createAdminClubSlotsApi,
  type AdminClubSlotsApi,
} from "./club-slots.client";
export { adminClubSlotsEndpoints } from "./club-slots.endpoint";
export type {
  CancelSlotOccurrenceInput,
  ClubClass,
  ClubClassesList,
  ClubSlot,
  ClubSlotsList,
  CreateClubClassInput,
  CreateClubSlotInput,
  UpdateClubClassInput,
  UpdateClubSlotInput,
} from "./club-slots.dto";
export { adminClubSlotsKeys } from "./club-slots.keys";

export {
  createAdminSupportApi,
  type AdminSupportApi,
} from "./support.client";
export { adminSupportEndpoints } from "./support.endpoint";
export type {
  AdminFaqItem,
  AdminUpdateTicketInput,
  CreateFaqInput,
  ListAdminFaqQuery,
  ListAdminSupportTicketsQuery,
  UpdateFaqInput,
} from "./support.dto";
export { adminSupportKeys } from "./support.keys";
