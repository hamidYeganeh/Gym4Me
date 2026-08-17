export type CoachClientDetailActionsSectionProps = {
  sessionLogged: boolean;
  onLogSession: () => void;
  messaging?: boolean;
  onSendMessage?: () => void | Promise<void>;
};
