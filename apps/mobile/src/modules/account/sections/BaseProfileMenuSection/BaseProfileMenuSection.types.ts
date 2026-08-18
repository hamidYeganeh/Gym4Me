import type { ProfileMenuGroup } from "@/modules/account/lib/use-profile-menu";

export type BaseProfileMenuSectionProps = {
  groups: ProfileMenuGroup[];
  className?: string;
};
