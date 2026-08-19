"use client";

import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import { createAppConfigApi, type AppBootstrap } from "@repo/api/app-config";
import { useTranslations } from "next-intl";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { OptionalUpdateBanner } from "@/modules/app/components/OptionalUpdateBanner";
import { ForceUpdateScreen } from "@/modules/app/screens/ForceUpdateScreen";
import { apiClient } from "@/shared/lib/api-client";

export type Gym4MeFeatureKey =
  | "athlete.self_tracking"
  | "athlete.personal_records"
  | "athlete.workout_logging"
  | "health.device_sync";

type CachedBootstrap = { expiresAt: number; value: AppBootstrap };

type AppConfigContextValue = {
  bootstrap: AppBootstrap | null;
  appVersion: string;
  isReady: boolean;
  isEnabled: (key: Gym4MeFeatureKey, fallback?: boolean) => boolean;
  payload: (key: Gym4MeFeatureKey) => Record<string, unknown>;
  refresh: () => Promise<void>;
  dismissOptionalUpdate: () => void;
};

const CACHE_KEY = "gym4me.app-config.v1";
const INSTALLATION_KEY = "gym4me.installation-id";
const DEFAULTS: Record<Gym4MeFeatureKey, boolean> = {
  "athlete.self_tracking": true,
  "athlete.personal_records": true,
  "athlete.workout_logging": true,
  "health.device_sync": false,
};

const appConfigApi = createAppConfigApi(apiClient);
const AppConfigContext = createContext<AppConfigContextValue | null>(null);

async function installationId() {
  const existing = await Preferences.get({ key: INSTALLATION_KEY });
  if (existing.value) return existing.value;
  const created =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await Preferences.set({ key: INSTALLATION_KEY, value: created });
  return created;
}

async function installedVersion() {
  if (!Capacitor.isNativePlatform()) {
    return process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0";
  }
  const info = await App.getInfo();
  return info.version || "0.1.0";
}

function parseCache(value: string | null): CachedBootstrap | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as CachedBootstrap;
    return parsed?.value?.schemaVersion === 1 ? parsed : null;
  } catch {
    return null;
  }
}

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const tOptional = useTranslations("OptionalUpdate");
  const [bootstrap, setBootstrap] = useState<AppBootstrap | null>(null);
  const [appVersion, setAppVersion] = useState(
    () => process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
  );
  const [isReady, setReady] = useState(false);
  const [optionalDismissed, setOptionalDismissed] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [version, deviceId] = await Promise.all([
        installedVersion(),
        installationId(),
      ]);
      setAppVersion(version);
      const platform = Capacitor.getPlatform();
      const value = await appConfigApi.fetchBootstrap({
        platform:
          platform === "ios" || platform === "android" ? platform : "web",
        appVersion: version,
        installationId: deviceId,
        channel:
          (process.env.NEXT_PUBLIC_RELEASE_CHANNEL as
            | "production"
            | "beta"
            | "development"
            | undefined) || "production",
      });
      setBootstrap(value);
      await Preferences.set({
        key: CACHE_KEY,
        value: JSON.stringify({
          expiresAt: Date.now() + value.cacheTtlSeconds * 1000,
          value,
        } satisfies CachedBootstrap),
      });
    } catch {
      // Cached/bundled defaults keep the app usable while config is offline.
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void Preferences.get({ key: CACHE_KEY })
      .then(({ value }) => {
        if (!active) return;
        const cached = parseCache(value);
        if (cached) setBootstrap(cached.value);
        if (!cached || cached.expiresAt <= Date.now()) return refresh();
        setReady(true);
      })
      .catch(() => refresh());
    return () => {
      active = false;
    };
  }, [refresh]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const interval = window.setInterval(() => void refresh(), 5 * 60_000);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refresh]);

  const dismissOptionalUpdate = useCallback(() => {
    setOptionalDismissed(true);
  }, []);

  const context = useMemo<AppConfigContextValue>(
    () => ({
      bootstrap,
      appVersion,
      isReady,
      isEnabled: (key, fallback = DEFAULTS[key]) =>
        bootstrap?.features[key]?.enabled ?? fallback,
      payload: (key) => bootstrap?.features[key]?.payload ?? {},
      refresh,
      dismissOptionalUpdate,
    }),
    [appVersion, bootstrap, dismissOptionalUpdate, isReady, refresh],
  );

  const compatibility = bootstrap?.compatibility;
  if (compatibility?.updateRequired) {
    const notes = compatibility.releaseNotes;
    return (
      <AppConfigContext.Provider value={context}>
        <ForceUpdateScreen
          currentVersion={appVersion}
          features={notes?.features}
          minimumVersion={compatibility.minimumAppVersion}
          title={notes?.title}
          updateUrl={compatibility.updateUrl}
        />
      </AppConfigContext.Provider>
    );
  }

  const showOptionalBanner =
    Boolean(compatibility?.updateAvailable) && !optionalDismissed;
  const notes = compatibility?.releaseNotes;

  return (
    <AppConfigContext.Provider value={context}>
      {showOptionalBanner ? (
        <OptionalUpdateBanner
          body={tOptional("body", {
            version: compatibility?.latestAppVersion ?? "",
          })}
          features={notes?.features ?? []}
          title={notes?.title?.trim() || tOptional("title")}
          updateUrl={compatibility?.updateUrl ?? null}
          onDismiss={dismissOptionalUpdate}
          onUpdate={() => {
            const url = compatibility?.updateUrl;
            if (!url) return;
            window.open(url, "_blank", "noopener,noreferrer");
          }}
        />
      ) : null}
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  const value = useContext(AppConfigContext);
  if (!value) throw new Error("useAppConfig must be used inside AppConfigProvider");
  return value;
}

export function useFeatureFlag(key: Gym4MeFeatureKey, fallback?: boolean) {
  return useAppConfig().isEnabled(key, fallback);
}
