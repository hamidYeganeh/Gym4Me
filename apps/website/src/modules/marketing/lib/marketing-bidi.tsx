import type { ReactNode } from "react";

/** Keep Latin / numeric / URL runs from reordering inside RTL copy. */
export function Ltr({
  children,
  className,
  as: Tag = "span",
}: {
  children: ReactNode;
  className?: string;
  as?: "span" | "p" | "div";
}) {
  return (
    <Tag className={className} dir="ltr">
      {children}
    </Tag>
  );
}
