export const UPLOAD_PURPOSES = [
  "verification",
  "avatar",
  "club_gallery",
  "advertising_creative",
  "general",
  "progress_photo",
  "social_post",
  "meal_adherence",
] as const;
export type UploadPurpose = (typeof UPLOAD_PURPOSES)[number];

export const ASSET_VISIBILITIES = ["private", "organization", "public"] as const;
export type AssetVisibility = (typeof ASSET_VISIBILITIES)[number];
