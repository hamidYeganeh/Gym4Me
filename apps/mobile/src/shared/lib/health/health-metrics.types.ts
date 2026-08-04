export type HealthMetricsPlatform = "ios" | "android" | "web" | "unknown";

export type HealthMetricsDataType =
  | "steps"
  | "distance"
  | "calories"
  | "heartRate"
  | "weight";

export type HealthMetricsConnectStatus =
  | "idle"
  | "checking"
  | "unsupported"
  | "available"
  | "connecting"
  | "connected"
  | "denied"
  | "error";

export type HealthMetricsAuthorization = {
  readAuthorized: HealthMetricsDataType[];
  readDenied: HealthMetricsDataType[];
  writeAuthorized: HealthMetricsDataType[];
  writeDenied: HealthMetricsDataType[];
};

export type HealthMetricsConnectResult =
  | {
      ok: true;
      status: "connected" | "denied";
      authorization: HealthMetricsAuthorization;
      platform: HealthMetricsPlatform;
    }
  | {
      ok: false;
      status: "unsupported" | "error";
      reason?: string;
      platform: HealthMetricsPlatform;
    };

export type UseHealthMetricsConnectOptions = {
  /** Health data types to request read access for. */
  read?: HealthMetricsDataType[];
  /** Health data types to request write access for. */
  write?: HealthMetricsDataType[];
  /** Auto-check availability + auth on mount. Defaults to true. */
  autoCheck?: boolean;
};

export type UseHealthMetricsConnectReturn = {
  status: HealthMetricsConnectStatus;
  platform: HealthMetricsPlatform;
  isSupported: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  reason?: string;
  authorization: HealthMetricsAuthorization | null;
  /** Prompt Apple Health / Health Connect permission sheet (covers watch-synced data). */
  connect: () => Promise<HealthMetricsConnectResult>;
  /** Re-check availability and current authorization without prompting. */
  refresh: () => Promise<void>;
  /** Android: open Health Connect settings when available. */
  openSettings: () => Promise<boolean>;
};
