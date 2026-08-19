import type { HTMLAttributes } from "react";
import type { Role } from "@repo/api";

export type RoleRequestWizardScreenProps = HTMLAttributes<HTMLDivElement> & {
  role: Extract<Role, "coach" | "club_owner">;
  roleSegment?: "athlete" | "coach" | "owner";
};
