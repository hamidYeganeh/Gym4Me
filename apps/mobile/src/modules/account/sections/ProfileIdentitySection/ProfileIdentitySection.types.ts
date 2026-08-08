import type { HTMLAttributes } from "react";

export type ProfileIdentitySectionProps = HTMLAttributes<HTMLElement> & {
  name: string;
  roleLabel: string;
  subtitle: string;
  avatarSrc?: string;
  avatarAlt?: string;
};
