/**
 * Figma map location pin (artboard 104×112 → content 48×54.5).
 * Accent ring + tip for the active/nearest pin; optional avatar + pulse rings.
 */

const PIN_SIZE = 48;
/** Tip overlaps the circle by 7px (Figma: tip base y=49, circle bottom y=56). */
const PIN_TIP_OVERLAP = 7;
const PIN_TIP_HEIGHT = 13.5;
const PIN_HEIGHT = PIN_SIZE + PIN_TIP_HEIGHT - PIN_TIP_OVERLAP;
const PIN_INNER = 40;
/** Tip base half-width from Figma (59.7942 − 44.2058) / 2. */
const PIN_TIP_HALF = 7.7942;
const PULSE_RING_SIZE = 56;

function escapeAttr(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export type MapLocationPinOptions = {
  /** Resolved `--accent`. */
  accent: string;
  /** Ring / tip color for inactive pins (defaults to a near-black overlay). */
  inactiveRing?: string;
  /** Optional avatar / logo URL for the inner well. */
  imageUrl?: string | null;
  /** Selected pins render slightly larger with accent chrome. */
  active?: boolean;
  /** Nearest pin draws expanding pulse rings behind the marker. */
  pulse?: boolean;
  /** Optional distance chip above the pin (e.g. "500m"). */
  distanceLabel?: string | null;
};

export function mapLocationPinHtml({
  accent,
  inactiveRing = "#111111",
  imageUrl,
  active = false,
  pulse = false,
  distanceLabel,
}: MapLocationPinOptions): string {
  const scale = active ? 1.12 : 1;
  const tipTop = PIN_SIZE - PIN_TIP_OVERLAP;
  const ring = active ? accent : inactiveRing;
  const showTip = active;
  const height = showTip ? PIN_HEIGHT : PIN_SIZE;

  const well = imageUrl
    ? `<img src="${escapeAttr(imageUrl)}" alt="" width="${PIN_INNER}" height="${PIN_INNER}" style="display:block;width:100%;height:100%;object-fit:cover;border-radius:9999px" draggable="false"/>`
    : "";

  const label =
    distanceLabel != null && distanceLabel !== ""
      ? `<div style="position:absolute;left:50%;bottom:calc(100% + 6px);transform:translateX(-50%);z-index:2;padding:3px 8px;border-radius:9999px;background:color-mix(in oklab,${escapeAttr(accent)} 22%,#111);color:${escapeAttr(accent)};font-size:11px;font-weight:700;line-height:1.2;white-space:nowrap;pointer-events:none;box-shadow:0 4px 12px rgba(0,0,0,0.35)">${escapeText(distanceLabel)}</div>`
      : "";

  /** Inline animation so Leaflet divIcons do not depend on Tailwind scanning. */
  const pulseRings = pulse
    ? `<div aria-hidden="true" style="position:absolute;left:50%;top:${PIN_SIZE / 2}px;z-index:0;width:0;height:0;pointer-events:none">
      <span style="position:absolute;left:0;top:0;width:${PULSE_RING_SIZE}px;height:${PULSE_RING_SIZE}px;margin:0;border:2px solid ${escapeAttr(accent)};border-radius:9999px;transform:translate(-50%,-50%) scale(0.45);opacity:0;animation:g4m-map-pin-pulse 2.25s ease-out infinite;animation-delay:0s"></span>
      <span style="position:absolute;left:0;top:0;width:${PULSE_RING_SIZE}px;height:${PULSE_RING_SIZE}px;margin:0;border:2px solid ${escapeAttr(accent)};border-radius:9999px;transform:translate(-50%,-50%) scale(0.45);opacity:0;animation:g4m-map-pin-pulse 2.25s ease-out infinite;animation-delay:0.75s"></span>
      <span style="position:absolute;left:0;top:0;width:${PULSE_RING_SIZE}px;height:${PULSE_RING_SIZE}px;margin:0;border:2px solid ${escapeAttr(accent)};border-radius:9999px;transform:translate(-50%,-50%) scale(0.45);opacity:0;animation:g4m-map-pin-pulse 2.25s ease-out infinite;animation-delay:1.5s"></span>
    </div>`
    : "";

  const tip = showTip
    ? `<svg width="${PIN_SIZE}" height="${PIN_TIP_HEIGHT + PIN_TIP_OVERLAP}" viewBox="0 0 ${PIN_SIZE} ${PIN_TIP_HEIGHT + PIN_TIP_OVERLAP}" style="position:absolute;inset-inline-start:0;top:${tipTop}px;overflow:visible" aria-hidden="true">
      <path d="M${PIN_SIZE / 2} ${PIN_TIP_HEIGHT + PIN_TIP_OVERLAP} L${PIN_SIZE / 2 - PIN_TIP_HALF} 0 L${PIN_SIZE / 2 + PIN_TIP_HALF} 0 Z" fill="${escapeAttr(ring)}"/>
    </svg>`
    : "";

  const chrome = `<div style="position:relative;width:${PIN_SIZE}px;height:${height}px;filter:drop-shadow(0 8px 9px rgba(0,0,0,0.18)) drop-shadow(0 16px 20px rgba(0,0,0,0.22))">
    ${label}
    <div style="position:absolute;inset-inline-start:0;top:0;z-index:1;display:grid;place-items:center;width:${PIN_SIZE}px;height:${PIN_SIZE}px;border-radius:9999px;background:${escapeAttr(ring)};box-shadow:${active ? `0 0 0 3px color-mix(in oklab,${escapeAttr(accent)} 35%,transparent)` : "none"}">
      <div style="width:${PIN_INNER}px;height:${PIN_INNER}px;border-radius:9999px;overflow:hidden;background:#1a1a1a">${well}</div>
    </div>
    ${tip}
  </div>`;

  return `<div style="transform:translate(-50%,-100%) scale(${scale});transform-origin:bottom center;width:${PIN_SIZE}px;height:${height}px;pointer-events:auto;cursor:pointer;user-select:none">
  <div style="position:relative;width:${PIN_SIZE}px;height:${height}px;overflow:visible">
    ${pulseRings}
    ${chrome}
  </div>
</div>`;
}

/** Exported for layout math in map consumers. */
export const MAP_LOCATION_PIN_PULSE_SIZE = PULSE_RING_SIZE;
