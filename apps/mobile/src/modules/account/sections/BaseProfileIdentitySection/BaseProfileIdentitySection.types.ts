export type BaseProfileIdentitySectionProps = {
  displayName: string;
  activeRoleLabel: string;
  memberSince?: string | null;
  showKycCta: boolean;
  onHelpPress: () => void;
  onKycPress: () => void;
  className?: string;
};
