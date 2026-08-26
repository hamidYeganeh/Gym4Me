/** Account profile — base + role profiles (`/account/profile`). */
export const accountProfileEndpoints = {
  me: "/account/profile/me",
  settings: "/account/profile/settings",
  athlete: "/account/profile/athlete",
  coach: "/account/profile/coach",
  coachVerification: "/account/profile/coach/verification",
  accountDeletion: "/account/profile/data-rights/deletion",
  locations: "/account/profile/locations",
  location: (id: string) => `/account/profile/locations/${id}`,
} as const;
