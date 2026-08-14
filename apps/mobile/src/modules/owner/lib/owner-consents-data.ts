export type OwnerConsentPolicyKind =
  | "rules"
  | "health_declaration"
  | "privacy";

export type OwnerConsentStatus = "published" | "draft";

export type OwnerConsentPolicy = {
  id: string;
  kind: OwnerConsentPolicyKind;
  version: string;
  status: OwnerConsentStatus;
  acceptanceCount: number;
  updatedAtLabel: string;
};

export const OWNER_CONSENTS: OwnerConsentPolicy[] = [
  {
    id: "con-1",
    kind: "rules",
    version: "v3.2",
    status: "published",
    acceptanceCount: 1240,
    updatedAtLabel: "۱۴۰۳/۰۴/۰۱",
  },
  {
    id: "con-2",
    kind: "health_declaration",
    version: "v2.0",
    status: "published",
    acceptanceCount: 1180,
    updatedAtLabel: "۱۴۰۳/۰۳/۱۵",
  },
  {
    id: "con-3",
    kind: "privacy",
    version: "v1.5",
    status: "published",
    acceptanceCount: 1240,
    updatedAtLabel: "۱۴۰۲/۱۲/۲۰",
  },
  {
    id: "con-4",
    kind: "rules",
    version: "v3.3-draft",
    status: "draft",
    acceptanceCount: 0,
    updatedAtLabel: "۱۴۰۳/۰۵/۲۰",
  },
];
