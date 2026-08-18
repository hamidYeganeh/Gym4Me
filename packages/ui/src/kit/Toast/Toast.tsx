"use client";

import type { ComponentProps, ReactNode } from "react";
import { Toast as HeroToast, toast as heroToast, type ToastContentValue } from "@heroui/react/toast";
import { ArrowRotateClockwise1 } from "@repo/icons/ArrowRotateClockwise1";
import { ShapeCircle } from "@repo/icons/ShapeCircle";
import { toastVariants } from "./Toast.styles";
import type { ToasterProps, ToastIconType, ToastVisualVariant } from "./Toast.types";

function DefaultToastIcon({
  type,
}: {
  type: ToastIconType | string | undefined;
}) {
  if (type === "loading") {
    return (
      <ArrowRotateClockwise1 aria-hidden className="animate-spin" size={20} />
    );
  }
  return <ShapeCircle aria-hidden size={20} />;
}

export type NotifyOptions = {
  description?: string;
  indicator?: ReactNode;
};

function withIcon(type: ToastIconType, options?: NotifyOptions) {
  return {
    description: options?.description,
    indicator: options?.indicator ?? <DefaultToastIcon type={type} />,
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

function ToastView({
  content,
  toastItem,
}: {
  content: ToastContentValue;
  toastItem: ComponentProps<typeof HeroToast>["toast"];
}) {
  const variant: ToastVisualVariant = content.variant ?? "default";
  const styles = toastVariants({ variant });
  const isLoading = content.isLoading === true;

  return (
    <HeroToast className={styles.root()} toast={toastItem} variant={variant}>
      {content.indicator === null ? null : (
        <HeroToast.Indicator className={styles.indicator()} variant={variant}>
          {isLoading ? (
            <DefaultToastIcon type="loading" />
          ) : (
            (content.indicator ?? <DefaultToastIcon type={variant} />)
          )}
        </HeroToast.Indicator>
      )}
      <HeroToast.Content className={styles.content()}>
        {content.title ? (
          <HeroToast.Title className={styles.title()}>
            {content.title}
          </HeroToast.Title>
        ) : null}
        {content.description ? (
          <HeroToast.Description className={styles.description()}>
            {content.description}
          </HeroToast.Description>
        ) : null}
      </HeroToast.Content>
      <HeroToast.CloseButton className={styles.close()} />
    </HeroToast>
  );
}

export function Toaster({
  children,
  placement = "bottom end",
  width = "min(22.5rem, calc(100vw - 2rem))",
}: ToasterProps) {
  return (
    <>
      {children}
      <HeroToast.Provider placement={placement} width={width}>
        {({ toast: toastItem }) => (
          <ToastView
            content={(toastItem.content ?? {}) as ToastContentValue}
            toastItem={toastItem}
          />
        )}
      </HeroToast.Provider>
    </>
  );
}
