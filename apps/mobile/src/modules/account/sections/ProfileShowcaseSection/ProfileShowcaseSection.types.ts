import type { HTMLAttributes } from "react";
import type { ProfileRoleShowcase } from "../../lib/profile-role-data";

export type ProfileShowcaseSectionProps = HTMLAttributes<HTMLElement> & {
  showcase: ProfileRoleShowcase;
  /** next-intl translator scoped to Mobile.Profile */
  t: (key: string) => string;
};
