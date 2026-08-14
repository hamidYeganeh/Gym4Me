export type FamilyConsentStatus = "pending" | "granted" | "revoked";

export type ChildProfile = {
  id: string;
  name: string;
  birthDateLabel: string;
  consentStatus: FamilyConsentStatus;
};

export type AddChildInput = {
  name: string;
  birthDate: string;
};

export const DEFAULT_CHILD_PROFILES: ChildProfile[] = [
  {
    id: "ch1",
    name: "آراد حسینی",
    birthDateLabel: "۱۳۹۸/۰۳/۱۵",
    consentStatus: "granted",
  },
  {
    id: "ch2",
    name: "سپهر حسینی",
    birthDateLabel: "۱۴۰۱/۰۷/۰۲",
    consentStatus: "pending",
  },
];
