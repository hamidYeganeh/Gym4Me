"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import { OnboardingPermissionSheet } from "@/modules/app/sections/OnboardingPermissionSheet";
import {
  checkDevicePermission,
  isDevicePermissionGranted,
  requestDevicePermission,
  skipDevicePermission,
  type DevicePermissionKind,
  type DevicePermissionResult,
} from "@/shared/lib/device-permissions";

export type EnsureDevicePermissionResult =
  | DevicePermissionResult
  | "skipped";

type PendingRequest = {
  kind: DevicePermissionKind;
  resolve: (result: EnsureDevicePermissionResult) => void;
};

type DevicePermissionsContextValue = {
  /** Show rationale + request OS access when not already granted. */
  ensurePermission: (
    kind: DevicePermissionKind,
  ) => Promise<EnsureDevicePermissionResult>;
  isPromptOpen: boolean;
  activeKind: DevicePermissionKind | null;
};

const DevicePermissionsContext =
  createContext<DevicePermissionsContextValue | null>(null);

function pumpNext(
  queueRef: { current: PendingRequest[] },
  setActive: (kind: DevicePermissionKind | null) => void,
) {
  const next = queueRef.current[0];
  setActive(next?.kind ?? null);
}

export function DevicePermissionsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const t = useTranslations("Mobile.Onboarding");
  const queueRef = useRef<PendingRequest[]>([]);
  const [activeKind, setActiveKind] = useState<DevicePermissionKind | null>(
    null,
  );
  const [isRequesting, setIsRequesting] = useState(false);

  const settleActive = useCallback((result: EnsureDevicePermissionResult) => {
    const current = queueRef.current.shift();
    current?.resolve(result);
    pumpNext(queueRef, setActiveKind);
  }, []);

  const ensurePermission = useCallback(
    async (kind: DevicePermissionKind): Promise<EnsureDevicePermissionResult> => {
      const existing = await checkDevicePermission(kind);
      if (isDevicePermissionGranted(existing)) {
        return "granted";
      }

      return new Promise((resolve) => {
        queueRef.current.push({ kind, resolve });
        if (queueRef.current.length === 1) {
          setActiveKind(kind);
        }
      });
    },
    [],
  );

  const handleContinue = useCallback(() => {
    if (!activeKind || isRequesting) return;
    setIsRequesting(true);
    void requestDevicePermission(activeKind)
      .catch((): DevicePermissionResult => "denied")
      .then((result) => {
        setIsRequesting(false);
        settleActive(result);
      });
  }, [activeKind, isRequesting, settleActive]);

  const handleSkip = useCallback(() => {
    if (!activeKind || isRequesting) return;
    skipDevicePermission(activeKind);
    settleActive("skipped");
  }, [activeKind, isRequesting, settleActive]);

  const value = useMemo<DevicePermissionsContextValue>(
    () => ({
      ensurePermission,
      isPromptOpen: activeKind != null,
      activeKind,
    }),
    [activeKind, ensurePermission],
  );

  return (
    <DevicePermissionsContext.Provider value={value}>
      {children}
      {activeKind ? (
        <OnboardingPermissionSheet
          isOpen
          isRequesting={isRequesting}
          kind={activeKind}
          labels={{
            title: t(`permissions.${activeKind}.title`),
            subtitle: t(`permissions.${activeKind}.subtitle`),
            sampleTitle: t(`permissions.${activeKind}.sampleTitle`),
            sampleBody: t(`permissions.${activeKind}.sampleBody`),
            sampleAction: t(`permissions.${activeKind}.sampleAction`),
            sampleTime: t(`permissions.${activeKind}.sampleTime`),
            info: t("permissions.info"),
            continue: t("permissions.continue"),
            skip: t("permissions.skip"),
          }}
          onContinue={handleContinue}
          onOpenChange={(open) => {
            if (!open && !isRequesting) {
              handleSkip();
            }
          }}
          onSkip={handleSkip}
        />
      ) : null}
    </DevicePermissionsContext.Provider>
  );
}

export function useDevicePermissions(): DevicePermissionsContextValue {
  const value = useContext(DevicePermissionsContext);
  if (!value) {
    throw new Error(
      "useDevicePermissions must be used within DevicePermissionsProvider",
    );
  }
  return value;
}
