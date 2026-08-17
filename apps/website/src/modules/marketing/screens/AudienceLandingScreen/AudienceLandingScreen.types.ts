export type AudienceLandingScreenLink = {
  label: string;
  href: string;
};

export type AudienceLandingScreenCapability = {
  title: string;
  description: string;
};

export type AudienceLandingScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
  primary: AudienceLandingScreenLink;
  secondary: AudienceLandingScreenLink;
  capabilities: AudienceLandingScreenCapability[];
  outcomes: string[];
};
