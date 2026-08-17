import type { ReactNode } from "react";

export type SettingsPreferencesSectionProps = {
  title: string;
  notificationsLabel: string;
  notificationsHint: string;
  themeLabel: string;
  themeHint: string;
  themeAriaLabel: string;
  languageLabel: string;
  languageValue: string;
  icons: {
    bell: ReactNode;
    moon: ReactNode;
    globe: ReactNode;
  };
  onNotificationsPress: () => void;
  className?: string;
};
