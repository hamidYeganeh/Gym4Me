import type { HTMLAttributes } from "react";
import type { ConnectionErrorKind } from "@/shared/lib/classify-connection-error";

export type ConnectionErrorStateProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  kind: ConnectionErrorKind;
  statusCode?: number;
  onRetry?: () => void;
  onDashboard?: () => void;
};
