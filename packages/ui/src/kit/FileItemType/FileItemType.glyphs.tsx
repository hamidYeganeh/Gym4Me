import type { FileItemTypeKind } from "./FileItemType.types";

/** Decorative watermarks in the document body (viewBox 0 0 44 56). */
export function FileItemTypeGlyph({
  type,
  className,
}: {
  type: FileItemTypeKind;
  className?: string;
}) {
  switch (type) {
    case "PDF":
      return (
        <path
          className={className}
          d="M22.5 28.5c-2.4 0-4.2 1.1-4.2 3.1 0 2.2 1.9 3.2 4 4.1 1.5.7 2.5 1.2 2.5 2.1 0 .7-.7 1.2-1.8 1.2-1.3 0-2.2-.6-2.9-1.1l-.9 1.6c.9.7 2.3 1.4 4 1.4 2.6 0 4.4-1.3 4.4-3.4 0-2.3-1.9-3.2-4-4.1-1.6-.7-2.5-1.2-2.5-2 0-.6.6-1.1 1.6-1.1 1.1 0 1.9.5 2.5.9l.8-1.6c-.8-.6-2-1.1-3.5-1.1Z"
        />
      );
    case "DOC":
      return (
        <>
          <path
            className={className}
            d="M18.2 31.2h1.7l2.1 5.4 2.1-5.4h1.7l-3.1 7.3h-1.4l-3.1-7.3Zm8.2 0h1.5v7.3h-1.5v-7.3Z"
          />
          <path
            className={className}
            d="M16 41.2h12v1.2H16zm0 2.4h9v1.2h-9zm0 2.4h11v1.2H16z"
          />
        </>
      );
    case "XLS":
      return (
        <>
          <path
            className={className}
            d="M16.5 32.5h4.2v4.2h-4.2zm5.2 0h4.2v4.2h-4.2zm5.2 0h4.2v4.2h-4.2zm-10.4 5.2h4.2v4.2h-4.2zm5.2 0h4.2v4.2h-4.2zm5.2 0h4.2v4.2h-4.2zm-10.4 5.2h4.2v4.2h-4.2zm5.2 0h4.2v4.2h-4.2zm5.2 0h4.2v4.2h-4.2z"
          />
        </>
      );
    case "PPT":
      return (
        <>
          <path
            className={className}
            d="M15.5 34h7v1.1h-7zm0 2.3h5.5v1.1H15.5zm0 2.3h6.2v1.1h-6.2zm0 2.3h4.8v1.1h-4.8z"
          />
          <path
            className={className}
            d="M28.5 40.5a4.2 4.2 0 1 1-8.4 0 4.2 4.2 0 0 1 8.4 0Zm-4.2-2.8v2.8h2.8a2.8 2.8 0 0 0-2.8-2.8Z"
          />
        </>
      );
    case "CSS":
      return (
        <>
          <rect
            className={className}
            x="15.5"
            y="32.5"
            width="13"
            height="8"
            rx="1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            className={className}
            d="M17.8 35.2h8.4v1H17.8zm0 2.2h6.2v1h-6.2zm0 4.8h8.4v1h-8.4zm0 2.2h5.5v1h-5.5z"
          />
        </>
      );
    case "JPG":
      return (
        <>
          <rect
            className={className}
            x="16"
            y="33"
            width="12"
            height="12"
            rx="1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <circle className={className} cx="19.5" cy="36.5" r="1.2" />
          <path
            className={className}
            d="M17 43.2 20.2 39l2.3 2.3 2.2-2.8L27 43.2H17Z"
          />
        </>
      );
    case "PSD":
      return (
        <>
          <rect className={className} x="16.5" y="33.5" width="11" height="11" rx="1.5" />
          <text
            x="22"
            y="41.2"
            textAnchor="middle"
            className="fill-surface text-[7px] font-bold"
          >
            Ps
          </text>
        </>
      );
    case "AI":
      return (
        <>
          <rect className={className} x="16.5" y="33.5" width="11" height="11" rx="1.5" />
          <text
            x="22"
            y="41.2"
            textAnchor="middle"
            className="fill-surface text-[7px] font-bold"
          >
            Ai
          </text>
        </>
      );
    case "MP4":
      return (
        <>
          <circle
            className={className}
            cx="22"
            cy="39"
            r="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <path className={className} d="M20.2 35.8v6.4L25.4 39 20.2 35.8Z" />
        </>
      );
    case "MP3":
      return (
        <path
          className={className}
          d="M24.5 33.2v9.2a2.4 2.4 0 1 1-1.4-2.2V36l5.2-1.2v5.4a2.4 2.4 0 1 1-1.4-2.2v-4.8l-2.4.6Z"
        />
      );
    default:
      return null;
  }
}

export const FILE_ITEM_TYPE_LABELS: Record<FileItemTypeKind, string> = {
  PDF: "PDF",
  DOC: "DOC",
  XLS: "XLS",
  PPT: "PPT",
  CSS: "CSS",
  JPG: "JPG",
  PSD: "PSD",
  AI: "Ai",
  MP4: "MP4",
  MP3: "MP3",
};
