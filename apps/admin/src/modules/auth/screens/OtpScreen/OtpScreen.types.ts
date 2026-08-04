export type OtpScreenProps = {
  className?: string;
};

export type OtpRouteState = {
  phone: string;
  expiresInSeconds: number;
  debugCode?: string;
};
