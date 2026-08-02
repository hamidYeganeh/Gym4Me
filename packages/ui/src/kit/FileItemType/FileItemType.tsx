"use client";

import {
  FILE_ITEM_TYPE_LABELS,
  FileItemTypeGlyph,
} from "./FileItemType.glyphs";
import { fileItemTypeVariants } from "./FileItemType.styles";
import type { FileItemTypeProps } from "./FileItemType.types";

export function FileItemType({
  type = "DOC",
  size = "md",
  className,
  "aria-label": ariaLabel,
}: FileItemTypeProps) {
  const slots = fileItemTypeVariants({ type, size });
  const label = FILE_ITEM_TYPE_LABELS[type];

  return (
    <span
      className={slots.root({ className })}
      role="img"
      aria-label={ariaLabel ?? `${label} file`}
      data-type={type}
      data-size={size}
    >
      <svg
        className={slots.svg()}
        viewBox="0 0 44 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {/* Document sheet with dog-ear */}
        <path
          className={slots.sheet()}
          strokeWidth="1.25"
          d="M10 2.5h18.2L39.5 13.8V49a4.5 4.5 0 0 1-4.5 4.5H10A4.5 4.5 0 0 1 5.5 49V7A4.5 4.5 0 0 1 10 2.5Z"
        />
        <path
          className={slots.fold()}
          strokeWidth="1.25"
          d="M28.2 2.5v8.3c0 1.7 1.4 3.1 3.1 3.1h8.2L28.2 2.5Z"
        />

        <g className="text-border">
          <FileItemTypeGlyph type={type} className={slots.mark()} />
        </g>

        {/* Type badge */}
        <rect
          className={slots.badge()}
          x="1"
          y="11.5"
          width="24"
          height="12"
          rx="6"
        />
        <text
          x="13"
          y="17.5"
          textAnchor="middle"
          dominantBaseline="central"
          className={slots.badgeLabel()}
        >
          {label}
        </text>
      </svg>
    </span>
  );
}
