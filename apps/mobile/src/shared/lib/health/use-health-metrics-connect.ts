"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_HEALTH_READ_TYPES,
  DEFAULT_HEALTH_WRITE_TYPES,
  emptyAuthorization,
  hasAnyReadAccess,
  loadHealthPlugin,
  normalizePlatform,
} from "./health-metrics";
import type {
  HealthMetricsAuthorization,
  HealthMetricsConnectResult,
  HealthMetricsConnectStatus,
  HealthMetricsPlatform,
  UseHealthMetricsConnectOptions,
  UseHealthMetricsConnectReturn,
} from "./health-metrics.types";

/**
 * Connects to the device health store (Apple Health / Health Connect).
 * Smartwatches (Apple Watch, Wear OS, etc.) sync into those stores — requesting
 * Health permissions is how apps read watch metrics on Capacitor.
 */
export function useHealthMetricsConnect(
  options: UseHealthMetricsConnectOptions = {},
): UseHealthMetricsConnectReturn {
  const {
    read = DEFAULT_HEALTH_READ_TYPES,
    write = DEFAULT_HEALTH_WRITE_TYPES,
    autoCheck = true,
  } = options;

  const readRef = useRef(read);
  const writeRef = useRef(write);
  readRef.current = read;
  writeRef.current = write;

  const [status, setStatus] = useState<HealthMetricsConnectStatus>(
    autoCheck ? "checking" : "idle",
  );
  const [platform, setPlatform] = useState<HealthMetricsPlatform>("unknown");
  const [reason, setReason] = useState<string | undefined>();
  const [authorization, setAuthorization] =
    useState<HealthMetricsAuthorization | null>(null);

  const refresh = async () => {
    try {
      const { Capacitor, Health } = await loadHealthPlugin();

      if (!Capacitor.isNativePlatform()) {
        setPlatform("web");
        setStatus("unsupported");
        setReason("native_only");
        setAuthorization(null);
        return;
      }

      const availability = await Health.isAvailable();
      const nextPlatform = normalizePlatform(availability.platform);
      setPlatform(nextPlatform);

      if (!availability.available) {
        setStatus("unsupported");
        setReason(availability.reason ?? "unavailable");
        setAuthorization(null);
        return;
      }

      const auth = await Health.checkAuthorization({
        read: readRef.current,
        write: writeRef.current,
      });
      setAuthorization(auth);
      setReason(undefined);
      setStatus(hasAnyReadAccess(auth) ? "connected" : "available");
    } catch (error) {
      setStatus("error");
      setReason(error instanceof Error ? error.message : "check_failed");
      setAuthorization(null);
    }
  };

  const connect = async (): Promise<HealthMetricsConnectResult> => {
    setStatus("connecting");
    setReason(undefined);

    try {
      const { Capacitor, Health } = await loadHealthPlugin();

      if (!Capacitor.isNativePlatform()) {
        const result: HealthMetricsConnectResult = {
          ok: false,
          status: "unsupported",
          reason: "native_only",
          platform: "web",
        };
        setPlatform("web");
        setStatus("unsupported");
        setReason("native_only");
        return result;
      }

      const availability = await Health.isAvailable();
      const nextPlatform = normalizePlatform(availability.platform);
      setPlatform(nextPlatform);

      if (!availability.available) {
        const result: HealthMetricsConnectResult = {
          ok: false,
          status: "unsupported",
          reason: availability.reason ?? "unavailable",
          platform: nextPlatform,
        };
        setStatus("unsupported");
        setReason(result.reason);
        return result;
      }

      const auth = await Health.requestAuthorization({
        read: readRef.current,
        write: writeRef.current,
      });
      setAuthorization(auth);

      if (hasAnyReadAccess(auth)) {
        setStatus("connected");
        return {
          ok: true,
          status: "connected",
          authorization: auth,
          platform: nextPlatform,
        };
      }

      setStatus("denied");
      return {
        ok: true,
        status: "denied",
        authorization: auth,
        platform: nextPlatform,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "connect_failed";
      setStatus("error");
      setReason(message);
      setAuthorization(emptyAuthorization());
      return {
        ok: false,
        status: "error",
        reason: message,
        platform,
      };
    }
  };

  const openSettings = async () => {
    try {
      const { Capacitor, Health } = await loadHealthPlugin();
      if (!Capacitor.isNativePlatform()) {
        return false;
      }

      const maybeOpen = (
        Health as {
          openHealthConnectSettings?: () => Promise<void>;
        }
      ).openHealthConnectSettings;

      if (typeof maybeOpen !== "function") {
        return false;
      }

      await maybeOpen.call(Health);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!autoCheck) {
      return;
    }

    let cancelled = false;

    void (async () => {
      await refresh();
      if (cancelled) {
        return;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [autoCheck]);

  return {
    status,
    platform,
    isSupported: status !== "unsupported",
    isConnected: status === "connected",
    isConnecting: status === "connecting" || status === "checking",
    reason,
    authorization,
    connect,
    refresh,
    openSettings,
  };
}
