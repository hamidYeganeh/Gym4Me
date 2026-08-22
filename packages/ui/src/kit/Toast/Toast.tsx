"use client";

import type { ComponentProps, ReactNode } from "react";
import { useEffect, useState } from "react";
import { I18nProvider } from "@react-aria/i18n";
import { Toast as HeroToast, toast as heroToast, type ToastContentValue } from "@heroui/react/toast";
import { ArrowRotateClockwise1 } from "@repo/icons/ArrowRotateClockwise1";
import { CheckCircle } from "@repo/icons/CheckCircle";
import { CloseXCircle } from "@repo/icons/CloseXCircle";
import { ExclamationMarkTriangle } from "@repo/icons/ExclamationMarkTriangle";
import { InfoCircle } from "@repo/icons/InfoCircle";
import { toastVariants } from "./Toast.styles";
import type { ToasterProps, ToastIconType, ToastVisualVariant } from "./Toast.types";

type DocumentLocale = {
  dir: "ltr" | "rtl";
  locale: string;
};

function readDocumentLocale(): DocumentLocale {
  if (typeof document === "undefined") {
    return { dir: "rtl", locale: "fa-IR" };
  }

  const root = document.documentElement;
  const dir = root.getAttribute("dir") === "ltr" ? "ltr" : "rtl";
  const lang = root.getAttribute("lang") || (dir === "rtl" ? "fa" : "en");
  const locale = lang === "fa" || lang.startsWith("fa-") ? "fa-IR" : lang;

  return { dir, locale };
}

function useDocumentLocale(): DocumentLocale {
  const [locale, setLocale] = useState<DocumentLocale>(readDocumentLocale);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setLocale(readDocumentLocale());
    const observer = new MutationObserver(sync);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["dir", "lang"],
    });
    return () => observer.disconnect();
  }, []);

  return locale;
}

function DefaultToastIcon({
  type,
}: {
  type: ToastIconType | ToastVisualVariant | string | undefined;
}) {
  const iconProps = { "aria-hidden": true as const, size: 20 };

  switch (type) {
    case "loading":
      return <ArrowRotateClockwise1 className="animate-spin" {...iconProps} />;
    case "success":
      return <CheckCircle {...iconProps} />;
    case "warning":
      return <ExclamationMarkTriangle {...iconProps} />;
    case "danger":
    case "error":
      return <CloseXCircle {...iconProps} />;
    case "info":
    case "accent":
    case "default":
    default:
      return <InfoCircle {...iconProps} />;
  }
}

export type NotifyOptions = {
  description?: ReactNode;
  indicator?: ReactNode;
};

function withIcon(type: ToastIconType, options?: NotifyOptions) {
  return {
    description: options?.description,
    indicator: options?.indicator ?? <DefaultToastIcon type={type} />,
  };
}

type NotifyFn = (title: ReactNode, options?: NotifyOptions) => void;

export type ToastNoticeVariant =
  | ToastVisualVariant
  | ToastIconType
  | "info"
  | "error";

export function toastNotice(
  variant: ToastNoticeVariant,
  title: ReactNode,
  options?: NotifyOptions,
) {
  switch (variant) {
    case "success":
      toast.success(title, options);
      return;
    case "warning":
      toast.warning(title, options);
      return;
    case "danger":
    case "error":
      toast.error(title, options);
      return;
    default:
      toast.info(title, options);
  }
}

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
  dir,
  toastItem,
}: {
  content: ToastContentValue;
  dir: DocumentLocale["dir"];
  toastItem: ComponentProps<typeof HeroToast>["toast"];
}) {
  const variant: ToastVisualVariant = content.variant ?? "default";
  const styles = toastVariants({ variant });
  const isLoading = content.isLoading === true;

  return (
    <HeroToast
      className={styles.root()}
      dir={dir}
      toast={toastItem}
      variant={variant}
    >
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
  const { dir, locale } = useDocumentLocale();

  return (
    <>
      {children}
      <I18nProvider locale={locale}>
        <HeroToast.Provider dir={dir} placement={placement} width={width}>
          {({ toast: toastItem }) => (
            <ToastView
              content={(toastItem.content ?? {}) as ToastContentValue}
              dir={dir}
              toastItem={toastItem}
            />
          )}
        </HeroToast.Provider>
      </I18nProvider>
    </>
  );
}
