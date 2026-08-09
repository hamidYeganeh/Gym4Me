/**
 * Usage: node build-from-raw.mjs [male|female|all]
 * Reads art/raw/<gender>/*.svg → writes art/<gender>/*.ts with themed CSS vars.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function themeMuscleSvg(rawSvg) {
  let svg = rawSvg.trim();
  svg = svg.replace(/<defs>[\s\S]*?<\/defs>/g, "");
  svg = svg.replace(/\s*clip-path="url\([^"]+\)"/g, "");
  svg = svg.replace(
    /<rect\s+width="88"\s+height="128"\s+rx="16"\s+fill="(?:white|#FFF7ED|#FFFFFF)"\s*\/>/gi,
    "",
  );
  svg = svg.replace(
    /<rect\s+x="0\.5"\s+y="0\.5"\s+width="87"\s+height="127"\s+rx="15\.5"\s+stroke="(?:#D4D4D8|#F97316)"\s*\/>/gi,
    "",
  );
  svg = svg.replace(/<g>\s*/g, "").replace(/\s*<\/g>/g, "");
  // Active Figma (orange) + idle Figma (zinc) → shared CSS vars
  svg = svg.replaceAll('fill="#FED7AA"', 'fill="var(--muscle-highlight)"');
  svg = svg.replaceAll('fill="#FFF7ED"', 'fill="var(--muscle-body)"');
  svg = svg.replaceAll(
    'stroke="#F97316"',
    'stroke="var(--muscle-stroke-strong)"',
  );
  svg = svg.replaceAll('stroke="#FDBA74"', 'stroke="var(--muscle-stroke)"');
  svg = svg.replaceAll('fill="#E4E4E7"', 'fill="var(--muscle-highlight)"');
  svg = svg.replaceAll(
    'stroke="#52525B"',
    'stroke="var(--muscle-stroke-strong)"',
  );
  svg = svg.replaceAll('fill="#FAFAFA"', 'fill="var(--muscle-body)"');
  svg = svg.replaceAll('fill="white"', 'fill="var(--muscle-surface)"');
  svg = svg.replaceAll('fill="#FFFFFF"', 'fill="var(--muscle-surface)"');
  svg = svg.replaceAll('stroke="#A1A1AA"', 'stroke="var(--muscle-stroke)"');
  svg = svg.replace(
    /<svg\b([^>]*)>/,
    '<svg width="88" height="128" viewBox="0 0 88 128" fill="none" xmlns="http://www.w3.org/2000/svg">',
  );
  return svg.replace(/\n{3,}/g, "\n").trim();
}

function toExportName(area, gender) {
  const suffix = gender === "female" ? "FemaleMuscleSvg" : "MaleMuscleSvg";
  return (
    area
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("") + suffix
  );
}

function buildGender(gender) {
  const rawDir = path.join(__dirname, "raw", gender);
  const outDir = path.join(__dirname, gender);
  if (!fs.existsSync(rawDir)) {
    console.warn("skip missing", rawDir);
    return 0;
  }
  fs.mkdirSync(outDir, { recursive: true });

  const files = fs.readdirSync(rawDir).filter((f) => f.endsWith(".svg"));
  if (files.length === 0) {
    console.warn("No raw SVGs in", rawDir);
    return 0;
  }

  const mapName =
    gender === "female" ? "femaleMuscleArtByArea" : "maleMuscleArtByArea";
  const exports = [];
  for (const file of files) {
    const area = path.basename(file, ".svg");
    const raw = fs.readFileSync(path.join(rawDir, file), "utf8");
    const themed = themeMuscleSvg(raw);
    const exportName = toExportName(area, gender);
    const out = `/** Themed ${gender} anatomy SVG for \`${area}\`. */\nexport const ${exportName} = ${JSON.stringify(themed)};\n`;
    fs.writeFileSync(path.join(outDir, `${area}.ts`), out);
    exports.push({ area, exportName });
    console.log("wrote", gender, area);
  }

  exports.sort((a, b) => a.area.localeCompare(b.area));
  const index = `${exports
    .map((e) => `export { ${e.exportName} } from "./${e.area}";`)
    .join("\n")}

import type { MuscleArtArea } from "../types";
${exports.map((e) => `import { ${e.exportName} } from "./${e.area}";`).join("\n")}

export const ${mapName}: Record<MuscleArtArea, string> = {
${exports.map((e) => `  "${e.area}": ${e.exportName},`).join("\n")}
};
`;
  fs.writeFileSync(path.join(outDir, "index.ts"), index);
  return exports.length;
}

const arg = process.argv[2] ?? "all";
const genders =
  arg === "all" ? ["male", "female"] : arg === "male" || arg === "female" ? [arg] : null;
if (!genders) {
  console.error("Usage: node build-from-raw.mjs [male|female|all]");
  process.exit(1);
}
for (const g of genders) {
  console.log("done", g, buildGender(g));
}
