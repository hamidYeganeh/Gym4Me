export type AudienceLandingAudience = "clubs" | "coaches" | "athletes";

export type AudienceLandingScreenCapability = {
  title: string;
  description: string;
};

export type AudienceLandingScreenProps = {
  audience: AudienceLandingAudience;
};
