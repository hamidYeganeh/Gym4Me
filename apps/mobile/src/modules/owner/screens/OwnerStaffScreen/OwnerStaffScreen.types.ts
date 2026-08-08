import type { OwnerStaffMember } from "../../lib/owner-staff-data";

export type OwnerStaffScreenProps = {
  staff: OwnerStaffMember[];
  /** Permission key → Persian label map. */
  grantLabels: Record<string, string>;
  className?: string;
};
