export type AthleteMetricsConnectSectionProps = {
  title: string;
  subtitle: string;
  actionLabel: string;
  connectingLabel: string;
  connectedLabel: string;
  unsupportedLabel: string;
  errorLabel: string;
  deniedLabel: string;
  status:
    | "idle"
    | "checking"
    | "unsupported"
    | "available"
    | "connecting"
    | "connected"
    | "denied"
    | "error";
  onConnect: () => void;
  onOpenSettings?: () => void;
  settingsLabel?: string;
};
