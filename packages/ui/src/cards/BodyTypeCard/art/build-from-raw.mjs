/**
 * Usage: node build-from-raw.mjs [male|female|all]
 * Reads art/raw/<gender>/*.svg → writes art/<gender>/*.ts with themed CSS vars.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function themeBodyTypeSvg(rawSvg) {
  let svg = rawSvg.trim();
  // #FAFAFA = primary body; white = softer highlight (matches active Figma blues)
  svg = svg.replaceAll('fill="#FAFAFA"', 'fill="var(--body-type-body)"');
  svg = svg.replaceAll('fill="white"', 'fill="var(--body-type-body-soft)"');
  svg = svg.replaceAll('fill="#FFFFFF"', 'fill="var(--body-type-body-soft)"');
  svg = svg.replaceAll('stroke="#D4D4D8"', 'stroke="var(--body-type-stroke)"');
  svg = svg.replace(
    /<svg\b([^>]*)>/,
    '<svg width="130" height="360" viewBox="0 0 130 360" fill="none" xmlns="http://www.w3.org/2000/svg">',
  );
  return svg.replace(/\n{3,}/g, "\n").trim();
}

function toExportName(kind, gender) {
  const suffix = gender === "female" ? "FemaleBodyTypeSvg" : "MaleBodyTypeSvg";
  return kind.charAt(0).toUpperCase() + kind.slice(1) + suffix;
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
    gender === "female" ? "femaleBodyTypeArtByKind" : "maleBodyTypeArtByKind";
  const exports = [];
  for (const file of files) {
    const kind = path.basename(file, ".svg");
    const raw = fs.readFileSync(path.join(rawDir, file), "utf8");
    const themed = themeBodyTypeSvg(raw);
    const exportName = toExportName(kind, gender);
    const out = `/** Themed ${gender} body-type SVG for \`${kind}\`. */\nexport const ${exportName} = ${JSON.stringify(themed)};\n`;
    fs.writeFileSync(path.join(outDir, `${kind}.ts`), out);
    exports.push({ kind, exportName });
    console.log("wrote", gender, kind);
  }

  exports.sort((a, b) => a.kind.localeCompare(b.kind));
  const index = `${exports
    .map((e) => `export { ${e.exportName} } from "./${e.kind}";`)
    .join("\n")}

import type { BodyTypeKind } from "../types";
${exports.map((e) => `import { ${e.exportName} } from "./${e.kind}";`).join("\n")}

export const ${mapName}: Record<BodyTypeKind, string> = {
${exports.map((e) => `  "${e.kind}": ${e.exportName},`).join("\n")}
};
`;
  fs.writeFileSync(path.join(outDir, "index.ts"), index);
  return exports.length;
}

const arg = process.argv[2] ?? "all";
const genders =
  arg === "all"
    ? ["male", "female"]
    : arg === "male" || arg === "female"
      ? [arg]
      : null;
if (!genders) {
  console.error("Usage: node build-from-raw.mjs [male|female|all]");
  process.exit(1);
}
for (const g of genders) {
  console.log("done", g, buildGender(g));
}
