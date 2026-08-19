#!/usr/bin/env node
/**
 * Repairs broken SecondaryPageHeader migrations.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(__dirname, "../apps/mobile/src");

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith(".tsx")) files.push(full);
  }
  return files;
}

function repair(source) {
  let next = source;

  // Fix orphaned remnants after SecondaryPageHeader self-close
  next = next.replace(
    /(<SecondaryPageHeader[\s\S]*?onBack=\{\(\) => router\.back\(\)\}\s*\/>)\s*<\/Button>\s*\}\s*(?:title=\{([^}]+\})\s*\/>)?/g,
    (_, headerStart, titleProp) => {
      const withoutClose = headerStart.replace(/\/>$/, "");
      const title = titleProp ? `\n          title={${titleProp}}` : "";
      return `${withoutClose}${title}\n        />`;
    },
  );

  // Fix case where title was on separate lines after broken block
  next = next.replace(
    /(<SecondaryPageHeader[\s\S]*?onBack=\{\(\) => router\.back\(\)\}\s*\/>)\s*<\/Button>\s*\}\s*title=\{([^}]+\})\s*\/>/g,
    (_, headerStart, titleProp) => {
      const withoutClose = headerStart.replace(/\/>$/, "");
      return `${withoutClose}\n          title={${titleProp}}\n        />`;
    },
  );

  // Clean unused ChevronLeft import
  if (!next.includes("ChevronLeft") && next.includes("@repo/icons/ChevronLeft")) {
    next = next.replace(/^import \{ ChevronLeft \} from "@repo\/icons\/ChevronLeft";\n/m, "");
  }

  return next;
}

function migrateRemainingHeader(source, filePath) {
  if (!source.includes('<Header') || !source.includes("ChevronLeft")) {
    return source;
  }

  let next = source;

  if (!next.includes("@repo/ui/layout/SecondaryPageHeader")) {
    next = next.replace(
      /^import \{ AppLayout \} from "@repo\/ui\/layout\/AppLayout";/m,
      `import { AppLayout } from "@repo/ui/layout/AppLayout";\nimport { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";`,
    );
  }

  // Full Header block with startContent/endContent/title
  next = next.replace(
    /<Header\b([\s\S]*?)startContent=\{\s*<Button[\s\S]*?ChevronLeft[\s\S]*?<\/Button>\s*\}([\s\S]*?)\/>/g,
    (match, middle, rest) => {
      const titleMatch = match.match(/\btitle=\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/);
      const endContentMatch = match.match(/\bendContent=\{([\s\S]*?\})\s*(?=startContent|title|\/>)/);
      const ariaMatch = match.match(/aria-label=\{([^}]+)\}/);
      const classNameMatch = match.match(/\bclassName=\{([^}]+)\}/);

      const props = [
        ariaMatch ? `backAriaLabel={${ariaMatch[1]}}` : 'backAriaLabel="Back"',
        "onBack={() => router.back()}",
        titleMatch ? `title={${titleMatch[1]}}` : "",
        endContentMatch ? `endContent={${endContentMatch[1].trim()}}` : "",
        classNameMatch ? `className={${classNameMatch[1]}}` : "",
      ]
        .filter(Boolean)
        .join("\n          ");

      return `<SecondaryPageHeader\n          ${props}\n        />`;
    },
  );

  next = next.replace(/^import \{ Header \} from "@repo\/ui\/layout\/Header";\n/m, "");

  if (!next.includes("ChevronLeft") && next.includes("@repo/icons/ChevronLeft")) {
    next = next.replace(/^import \{ ChevronLeft \} from "@repo\/icons\/ChevronLeft";\n/m, "");
  }

  return next;
}

const files = walk(mobileRoot);
let repaired = 0;

for (const file of files) {
  const original = fs.readFileSync(file, "utf8");
  if (!original.includes("SecondaryPageHeader") && !original.includes("<Header")) continue;

  let next = repair(original);
  next = migrateRemainingHeader(next, file);

  if (next !== original) {
    fs.writeFileSync(file, next);
    repaired += 1;
    console.log("fixed:", path.relative(mobileRoot, file));
  }
}

console.log(`\nRepaired ${repaired} files.`);
