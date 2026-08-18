/** Account profile — base + role profiles (`/account/profile`). */
export const accountProfileEndpoints = {
  me: "/account/profile/me",
  settings: "/account/profile/settings",
  athlete: "/account/profile/athlete",
  coach: "/account/profile/coach",
  coachVerification: "/account/profile/coach/verification",
} as const;
