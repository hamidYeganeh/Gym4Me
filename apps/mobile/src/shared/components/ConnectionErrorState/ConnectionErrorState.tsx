"use client";

import { ArrowRotateClockwise1 } from "@repo/icons/ArrowRotateClockwise1";
import { Chat } from "@repo/icons/Chat";
import { ExclamationMarkTriangle } from "@repo/icons/ExclamationMarkTriangle";
import { House1 } from "@repo/icons/House1";
import { WifiSlash } from "@repo/icons/WifiSlash";
import {
  EMPTY_STATE_ILLUSTRATIONS,
  EmptyState,
} from "@repo/ui/kit/EmptyState";
import { useTranslations } from "next-intl";
import { useContactSupport } from "@/shared/hooks/useContactSupport";
import { connectionErrorStateVariants } from "./ConnectionErrorState.styles";
import type { ConnectionErrorStateProps } from "./ConnectionErrorState.types";

export function ConnectionErrorState({
  kind,
  statusCode,
  onRetry,
  onDashboard,
  className,
  ...props
}: ConnectionErrorStateProps) {
  const tNetwork = useTranslations("Mobile.NetworkOffline");
  const tServer = useTranslations("Mobile.ServerError");
  const styles = connectionErrorStateVariants();
  const contactSupport = useContactSupport();

  if (kind === "network") {
    return (
      <div className={styles.root({ className })} {...props}>
        <EmptyState
          badge={tNetwork("badge")}
          badgeIcon={<WifiSlash size={14} />}
          description={tNetwork("description")}
          illustration={EMPTY_STATE_ILLUSTRATIONS.offline}
          illustrationAlt=""
          layout="media"
          primaryAction={
            onRetry
              ? {
                  label: tNetwork("refresh"),
                  onPress: onRetry,
                  startContent: <ArrowRotateClockwise1 size={20} />,
                }
              : undefined
          }
          secondaryAction={{
            label: tNetwork("contactSupport"),
            onPress: contactSupport,
            startContent: <Chat size={18} />,
          }}
          status="danger"
          title={tNetwork("title")}
        />
      </div>
    );
  }

  return (
    <div className={styles.root({ className })} {...props}>
      <EmptyState
        badge={tServer("badge", { code: statusCode ?? 500 })}
        badgeIcon={<ExclamationMarkTriangle size={14} />}
        description={tServer("description")}
        illustration={EMPTY_STATE_ILLUSTRATIONS.serverError}
        illustrationAlt=""
        layout="media"
        primaryAction={
          onDashboard
            ? {
                label: tServer("backToDashboard"),
                onPress: onDashboard,
                startContent: <House1 size={20} />,
              }
            : undefined
        }
        secondaryAction={{
          label: tServer("contactSupport"),
          onPress: contactSupport,
          startContent: <Chat size={18} />,
        }}
        status="danger"
        title={tServer("title")}
      />
    </div>
  );
}
