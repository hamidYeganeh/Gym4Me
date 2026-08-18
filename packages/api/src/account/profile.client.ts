import type { ApiClient } from "../client";
import type { PublicUser } from "../types";
import type {
  AthleteProfile,
  CoachProfile,
  ProfileSettings,
  SubmitCoachVerificationInput,
  UpdateAthleteProfileInput,
  UpdateCoachProfileInput,
  UpdateMeInput,
  UpdateProfileSettingsInput,
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
  };
}

export type AccountProfileApi = ReturnType<typeof createAccountProfileApi>;
