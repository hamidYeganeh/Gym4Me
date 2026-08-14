export type AudienceLandingLink = {
  label: string;
  href: string;
};

export type AudienceLandingCapability = {
  title: string;
  description: string;
};

export type AudienceLandingProps = {
  eyebrow: string;
  title: string;
  description: string;
  primary: AudienceLandingLink;
  secondary: AudienceLandingLink;
  capabilities: AudienceLandingCapability[];
  outcomes: string[];
};
