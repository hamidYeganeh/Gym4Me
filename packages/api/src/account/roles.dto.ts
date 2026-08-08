import type { PublicUser, Role } from "../types";

export type ApplyRoleInput = {
  role: Role;
};

export type ApplyRoleResponse = {
  roles: Role[];
  applied: Role;
  user: PublicUser;
};
