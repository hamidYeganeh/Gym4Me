import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const svgsDir = path.join(root, "svgs");
const outDir = path.join(root, "src", "icons");

const ATTR_MAP = {
  "fill-opacity": "fillOpacity",
  "stroke-opacity": "strokeOpacity",
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-miterlimit": "strokeMiterlimit",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "clip-path": "clipPath",
  "clip-rule": "clipRule",
  "fill-rule": "fillRule",
  "color-interpolation-filters": "colorInterpolationFilters",
  "flood-opacity": "floodOpacity",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "xmlns:xlink": "xmlnsXlink",
  "xlink:href": "xlinkHref",
  class: "className",
};

function toPascalCase(fileName) {
  const base = fileName.replace(/\.svg$/i, "");
  const parts = base.split(/[-_\s]+/).filter(Boolean);
  let name = parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  if (/^\d/.test(name)) name = `Icon${name}`;
  return name;
}

function camelCaseAttr(attr) {
  if (ATTR_MAP[attr]) return ATTR_MAP[attr];
  if (attr.startsWith("data-") || attr.startsWith("aria-")) return attr;
  if (!attr.includes("-") && !attr.includes(":")) return attr;
  return attr.replace(/[-:]([a-z])/gi, (_, c) => c.toUpperCase());
}

function toJsxInner(inner) {
  return inner
    .replace(/\sfill="black"/gi, ' fill="currentColor"')
    .replace(/\sfill='black'/gi, ' fill="currentColor"')
    .replace(/([^\s=]+)="([^"]*)"/g, (_, attr, value) => {
      return `${camelCaseAttr(attr)}="${value}"`;
    })
    .replace(/([^\s=]+)='([^']*)'/g, (_, attr, value) => {
      return `${camelCaseAttr(attr)}="${value}"`;
    })
    .replace(/\n\s*/g, "\n    ")
    .trim();
}

function extractSvg(content) {
  const viewBoxMatch = content.match(/viewBox="([^"]+)"/i);
  const viewBox = viewBoxMatch?.[1] ?? "0 0 24 24";

  const innerMatch = content.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  if (!innerMatch) {
    throw new Error("Could not parse SVG contents");
  }

  return { viewBox, inner: toJsxInner(innerMatch[1]) };
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const files = fs
  .readdirSync(svgsDir)
  .filter((file) => file.endsWith(".svg") && file !== "Icon.svg")
  .sort((a, b) => a.localeCompare(b));

const usedNames = new Map();
const exportsList = [];

for (const file of files) {
  let componentName = toPascalCase(file);
  const count = usedNames.get(componentName) ?? 0;
  usedNames.set(componentName, count + 1);
  if (count > 0) {
    componentName = `${componentName}${count + 1}`;
  }

  const raw = fs.readFileSync(path.join(svgsDir, file), "utf8");
  const { viewBox, inner } = extractSvg(raw);

  const source = `"use client";

import { createIcon } from "../create-icon";

export const ${componentName} = createIcon(
  "${componentName}",
  "${viewBox}",
  <>
    ${inner}
  </>,
);
`;

  fs.writeFileSync(path.join(outDir, `${componentName}.tsx`), source);
  exportsList.push(componentName);
}

const indexLines = [
  'export {',
  "  createIcon,",
  "  isRtlMirrorIcon,",
  "  type CreateIconOptions,",
  "  type IconProps,",
  '} from "./create-icon";',
  ...exportsList.map(
    (componentName) =>
      `export { ${componentName} } from "./icons/${componentName}";`,
  ),
  "",
];

fs.writeFileSync(path.join(root, "src", "index.ts"), indexLines.join("\n"));

const catalogLines = [
  "export const ICON_NAMES = [",
  ...exportsList.map((componentName) => `  "${componentName}",`),
  "] as const;",
  "",
  "export type IconName = (typeof ICON_NAMES)[number];",
  "",
  "const ICON_NAME_SET = new Set<string>(ICON_NAMES);",
  "",
  "export function isIconName(value: string): value is IconName {",
  "  return ICON_NAME_SET.has(value);",
  "}",
  "",
];

fs.writeFileSync(path.join(root, "src", "catalog.ts"), catalogLines.join("\n"));

console.log(`Generated ${exportsList.length} icons`);
