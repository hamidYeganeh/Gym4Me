/** Helpers mirroring locomotive-scroll v5 progress / offset math. */

export function parseOffsetToken(raw: string | undefined, viewportSize: number): number {
  const value = (raw ?? "0").trim();
  if (!value) return 0;
  if (value.includes("%")) {
    const pct = Number.parseFloat(value.replace("%", "").trim());
    return Number.isFinite(pct) ? viewportSize * pct * 0.01 : 0;
  }
  const px = Number.parseFloat(value);
  return Number.isFinite(px) ? px : 0;
}

export function splitCsv(value: string | undefined, fallback: [string, string]): [string, string] {
  const parts = (value ?? "").split(",").map((part) => part.trim());
  return [parts[0] || fallback[0], parts[1] || fallback[1]];
}

/** Format a pixel/percent offset for ScrollTrigger position strings. */
export function formatViewportOffset(raw: string): string {
  const value = raw.trim() || "0";
  if (value.includes("%")) return value;
  if (value.endsWith("px")) return value;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? `${n}px` : "0px";
}

/**
 * Map locomotive `data-scroll-position` + `data-scroll-offset` → ScrollTrigger start/end.
 *
 * Locomotive defaults: position `start,end`, offset `0,0`
 * - start@start+offset: element top hits (viewport bottom − startOffset)
 * - end@end+offset: element bottom hits endOffset from viewport top
 */
export function locomotiveToScrollTriggerEdges(options: {
  scrollOffset?: string;
  scrollPosition?: string;
  inFold: boolean;
  ignoreFold: boolean;
}): { start: string | number; end: string | number } {
  const [startOffsetRaw, endOffsetRaw] = splitCsv(options.scrollOffset, ["0", "0"]);
  const [startPosRaw, endPos] = splitCsv(options.scrollPosition, ["start", "end"]);

  const startPos =
    options.inFold && !options.ignoreFold ? "fold" : startPosRaw;

  const startOff = formatViewportOffset(startOffsetRaw);
  const endOff = formatViewportOffset(endOffsetRaw);

  const start =
    startPos === "fold"
      ? 0
      : startPos === "end"
        ? `bottom bottom-=${startOff}`
        : startPos === "middle"
          ? `center bottom-=${startOff}`
          : `top bottom-=${startOff}`;

  const end =
    endPos === "start"
      ? `top ${endOff}`
      : endPos === "middle"
        ? `center ${endOff}`
        : `bottom ${endOff}`;

  return { start, end };
}

export function isCoarsePointer(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(any-pointer: coarse)").matches;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
