"use client";

import { forwardRef, type ReactNode, type SVGProps } from "react";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "ref"> & {
  size?: number | string;
  title?: string;
};

export function createIcon(
  displayName: string,
  viewBox: string,
  children: ReactNode,
) {
  const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
    {
      size = 24,
      title,
      color = "currentColor",
      className,
      style,
      ...props
    },
    ref,
  ) {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        width={size}
        height={size}
        fill="none"
        color={color}
        className={className}
        style={style}
        aria-hidden={title ? undefined : true}
        role={title ? "img" : undefined}
        {...props}
      >
        {title ? <title>{title}</title> : null}
        {children}
      </svg>
    );
  });

  Icon.displayName = displayName;
  return Icon;
}
