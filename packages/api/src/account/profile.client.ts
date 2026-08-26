import type { ApiClient } from "../client";
import type { FavouriteLocation, PublicUser } from "../types";
import type {
  AthleteProfile,
  CoachProfile,
  CreateFavouriteLocationInput,
  FavouriteLocationsList,
  ProfileSettings,
  SubmitCoachVerificationInput,
  UpdateAthleteProfileInput,
  UpdateCoachProfileInput,
  UpdateFavouriteLocationInput,
  UpdateMeInput,
  UpdateProfileSettingsInput,
  AccountDeletionRequest,
  RequestAccountDeletionInput,
  CancelAccountDeletionInput,
} from "./profile.dto";
import { accountProfileEndpoints as ep } from "./profile.endpoint";

/** Account profile — base + role profiles (`/account/profile`). */
export function createAccountProfileApi(client: ApiClient) {
  return {
    getMe() {
      return client.request<PublicUser>(ep.me);
    },

    updateMe(input: UpdateMeInput) {
      return client.request<PublicUser>(ep.me, {
        method: "PATCH",
        body: input,
      });
    },

    getSettings() {
      return client.request<ProfileSettings>(ep.settings);
    },

    updateSettings(input: UpdateProfileSettingsInput) {
      return client.request<ProfileSettings>(ep.settings, {
        method: "PATCH",
        body: input,
      });
    },

    listFavouriteLocations() {
      return client.request<FavouriteLocationsList>(ep.locations);
    },

    getFavouriteLocation(id: string) {
      return client.request<FavouriteLocation>(ep.location(id));
    },

    createFavouriteLocation(input: CreateFavouriteLocationInput) {
      return client.request<FavouriteLocation>(ep.locations, {
        method: "POST",
        body: input,
      });
    },

    updateFavouriteLocation(id: string, input: UpdateFavouriteLocationInput) {
      return client.request<FavouriteLocation>(ep.location(id), {
        method: "PATCH",
        body: input,
      });
    },

    deleteFavouriteLocation(id: string) {
      return client.request<FavouriteLocationsList>(ep.location(id), {
        method: "DELETE",
      });
    },

    getAthlete() {
      return client.request<AthleteProfile>(ep.athlete);
    },

    updateAthlete(input: UpdateAthleteProfileInput) {
      return client.request<AthleteProfile>(ep.athlete, {
        method: "PATCH",
        body: input,
      });
    },

    getCoach() {
      return client.request<CoachProfile>(ep.coach);
    },

    updateCoach(input: UpdateCoachProfileInput) {
      return client.request<CoachProfile>(ep.coach, {
        method: "PATCH",
        body: input,
      });
    },

    submitCoachVerification(input: SubmitCoachVerificationInput) {
      return client.request<CoachProfile>(ep.coachVerification, {
        method: "POST",
        body: input,
      });
    },

    getAccountDeletionRequest() {
      return client.request<AccountDeletionRequest | null>(ep.accountDeletion);
    },

    requestAccountDeletion(input: RequestAccountDeletionInput) {
      return client.request<AccountDeletionRequest>(ep.accountDeletion, {
        method: "POST",
        body: input,
      });
    },

    cancelAccountDeletion(input: CancelAccountDeletionInput) {
      return client.request<AccountDeletionRequest>(ep.accountDeletion, {
        method: "DELETE",
        body: input,
      });
    },
  };
}

export type AccountProfileApi = ReturnType<typeof createAccountProfileApi>;
