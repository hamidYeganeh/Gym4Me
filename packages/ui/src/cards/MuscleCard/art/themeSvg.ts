/**
 * Strip card chrome from Figma exports and map fills/strokes to theme CSS vars.
 *
 * Idle → selected ladder (see MuscleCard.styles.ts for mix ratios):
 * - plate / #FAFAFA body → soft surface → accent-tint body
 * - white limbs → stay surface
 * - #E4E4E7 highlight → default → full accent fill
 * - #A1A1AA stroke → muted → accent mixed with foreground
 * - #52525B highlight stroke → strong muted → stronger accent/foreground mix
 */
export function themeMuscleSvg(rawSvg: string): string {
  let svg = rawSvg.trim();

  // Drop defs / clipPath (card clips via overflow-hidden)
  svg = svg.replace(/<defs>[\s\S]*?<\/defs>/g, "");
  svg = svg.replace(/\s*clip-path="url\([^"]+\)"/g, "");

  // Drop Figma plate + border (ToggleButton provides both; idle white / active tint)
  svg = svg.replace(
    /<rect\s+width="88"\s+height="128"\s+rx="16"\s+fill="(?:white|#FFF7ED|#FFFFFF)"\s*\/>/gi,
    "",
  );
  svg = svg.replace(
    /<rect\s+x="0\.5"\s+y="0\.5"\s+width="87"\s+height="127"\s+rx="15\.5"\s+stroke="(?:#D4D4D8|#F97316)"\s*\/>/gi,
    "",
  );

  // Unwrap empty <g> left after stripping clip-path
  svg = svg.replace(/<g>\s*/g, "").replace(/\s*<\/g>/g, "");

  // Active Figma exports (orange) → same CSS vars as idle zinc exports
  svg = svg.replaceAll('fill="#FED7AA"', 'fill="var(--muscle-highlight)"');
  svg = svg.replaceAll('fill="#FFF7ED"', 'fill="var(--muscle-body)"');
  svg = svg.replaceAll('stroke="#F97316"', 'stroke="var(--muscle-stroke-strong)"');
  svg = svg.replaceAll('stroke="#FDBA74"', 'stroke="var(--muscle-stroke)"');

  // Idle Figma exports (zinc)
  svg = svg.replaceAll('fill="#E4E4E7"', 'fill="var(--muscle-highlight)"');
  svg = svg.replaceAll(
    'stroke="#52525B"',
    'stroke="var(--muscle-stroke-strong)"',
  );
  svg = svg.replaceAll('fill="#FAFAFA"', 'fill="var(--muscle-body)"');
  // Keep white limbs distinct from soft body tint
  svg = svg.replaceAll('fill="white"', 'fill="var(--muscle-surface)"');
  svg = svg.replaceAll('fill="#FFFFFF"', 'fill="var(--muscle-surface)"');
  svg = svg.replaceAll('stroke="#A1A1AA"', 'stroke="var(--muscle-stroke)"');

  // Normalize root svg for card media slot
  svg = svg.replace(
    /<svg\b([^>]*)>/,
    '<svg width="88" height="128" viewBox="0 0 88 128" fill="none" xmlns="http://www.w3.org/2000/svg">',
  );

  return svg.replace(/\n{3,}/g, "\n").trim();
}
