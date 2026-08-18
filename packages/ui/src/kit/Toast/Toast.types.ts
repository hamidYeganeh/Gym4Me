import type { ReactNode } from "react";

export type ToastPlacement =
  | "top"
  | "bottom"
  | "top start"
  | "top end"
  | "bottom start"
  | "bottom end";

export type ToastVisualVariant =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger";

export type ToasterProps = {
  children?: ReactNode;
  placement?: ToastPlacement;
  width?: number | string;
};

export type ToastIconType =
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "error"
  | "loading";
