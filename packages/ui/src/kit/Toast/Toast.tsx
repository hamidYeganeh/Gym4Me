"use client";

import type { ReactNode } from "react";
import { Toast as HeroToast, toast as heroToast } from "@heroui/react";
import {
  ArrowRotateClockwise1,
  CheckCircle,
  CloseXCircle,
  ExclamationMarkTriangle,
  Info,
} from "@repo/icons";
import { toastVariants } from "./Toast.styles";
import type { ToasterProps, ToastIconType } from "./Toast.types";

const styles = toastVariants();

function ToastIcon({ type }: { type: ToastIconType | string | undefined }) {
  if (type === "success") {
    return <CheckCircle aria-hidden size={18} />;
  }
  if (type === "info") {
    return <Info aria-hidden size={18} />;
  }
  if (type === "warning") {
    return <ExclamationMarkTriangle aria-hidden size={18} />;
  }
  if (type === "error" || type === "danger") {
    return <CloseXCircle aria-hidden className="text-danger" size={18} />;
  }
  if (type === "loading") {
    return (
      <ArrowRotateClockwise1
        aria-hidden
        className="animate-spin"
        size={18}
      />
    );
  }
  return null;
}

export type NotifyOptions = {
  description?: string;
  indicator?: ReactNode;
};

function withIcon(type: ToastIconType, options?: NotifyOptions) {
  return {
    description: options?.description,
    indicator: options?.indicator ?? (
      <span className={styles.icon()}>
        <ToastIcon type={type} />
      </span>
    ),
  };
}

type NotifyFn = (title: string, options?: NotifyOptions) => void;

export const toast: {
  success: NotifyFn;
  info: NotifyFn;
  warning: NotifyFn;
  danger: NotifyFn;
  error: NotifyFn;
  close: (key?: string) => void;
  clear: () => void;
} = {
  success: (title, options) => {
    heroToast.success(title, withIcon("success", options));
  },
  info: (title, options) => {
    heroToast.info(title, withIcon("info", options));
  },
  warning: (title, options) => {
    heroToast.warning(title, withIcon("warning", options));
  },
  danger: (title, options) => {
    heroToast.danger(title, withIcon("danger", options));
  },
  error: (title, options) => {
    heroToast.danger(title, withIcon("error", options));
  },
  close: (key) => {
    if (key) heroToast.close(key);
  },
  clear: () => {
    heroToast.clear();
  },
};

export function Toaster({
  children,
  placement = "bottom end",
}: ToasterProps) {
  return (
    <>
      {children}
      <HeroToast.Provider placement={placement} />
    </>
  );
}
