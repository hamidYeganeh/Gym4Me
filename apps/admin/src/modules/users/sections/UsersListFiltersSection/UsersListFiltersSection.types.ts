import type { Key } from "react";
import type { Role, UserStatus } from "@repo/api";

export type UsersListFiltersSectionProps = {
  status: UserStatus | "all";
  role: Role | "all";
  onStatusChange: (value: UserStatus | "all") => void;
  onRoleChange: (value: Role | "all") => void;
  className?: string;
};

export type SelectChangeValue = Key | Key[] | null;
