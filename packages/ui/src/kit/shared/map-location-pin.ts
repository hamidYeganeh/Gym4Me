/**
 * Figma map location pin (artboard 104×112 → content 48×54.5).
 * Accent ring + tip; optional avatar in the inner well.
 */

const PIN_SIZE = 48;
/** Tip overlaps the circle by 7px (Figma: tip base y=49, circle bottom y=56). */
const PIN_TIP_OVERLAP = 7;
const PIN_TIP_HEIGHT = 13.5;
const PIN_HEIGHT = PIN_SIZE + PIN_TIP_HEIGHT - PIN_TIP_OVERLAP;
const PIN_INNER = 40;
/** Tip base half-width from Figma (59.7942 − 44.2058) / 2. */
const PIN_TIP_HALF = 7.7942;

function escapeAttr(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export type MapLocationPinOptions = {
  /** Resolved `--accent`. */
  accent: string;
  /** Optional avatar / logo URL for the inner well. */
  imageUrl?: string | null;
  /** Selected pins render slightly larger. */
  active?: boolean;
};

export function mapLocationPinHtml({
  accent,
  imageUrl,
  active = false,
}: MapLocationPinOptions): string {
  const scale = active ? 1.12 : 1;
  const tipTop = PIN_SIZE - PIN_TIP_OVERLAP;

  const well = imageUrl
    ? `<img src="${escapeAttr(imageUrl)}" alt="" width="${PIN_INNER}" height="${PIN_INNER}" style="display:block;width:100%;height:100%;object-fit:cover;border-radius:9999px" draggable="false"/>`
    : "";

  return `<div style="transform:translate(-50%,-100%) scale(${scale});transform-origin:bottom center;width:${PIN_SIZE}px;height:${PIN_HEIGHT}px;pointer-events:auto;cursor:pointer;user-select:none;filter:drop-shadow(0 8px 9px rgba(0,0,0,0.1)) drop-shadow(0 20px 20px rgba(0,0,0,0.1))">
  <div style="position:relative;width:${PIN_SIZE}px;height:${PIN_HEIGHT}px">
    <div style="position:absolute;inset-inline-start:0;top:0;z-index:1;display:grid;place-items:center;width:${PIN_SIZE}px;height:${PIN_SIZE}px;border-radius:9999px;background:${accent}">
      <div style="width:${PIN_INNER}px;height:${PIN_INNER}px;border-radius:9999px;overflow:hidden;background:#fff">${well}</div>
    </div>
    <svg width="${PIN_SIZE}" height="${PIN_TIP_HEIGHT + PIN_TIP_OVERLAP}" viewBox="0 0 ${PIN_SIZE} ${PIN_TIP_HEIGHT + PIN_TIP_OVERLAP}" style="position:absolute;inset-inline-start:0;top:${tipTop}px;overflow:visible" aria-hidden="true">
      <path d="M${PIN_SIZE / 2} ${PIN_TIP_HEIGHT + PIN_TIP_OVERLAP} L${PIN_SIZE / 2 - PIN_TIP_HALF} 0 L${PIN_SIZE / 2 + PIN_TIP_HALF} 0 Z" fill="${accent}"/>
    </svg>
  </div>
</div>`;
}
