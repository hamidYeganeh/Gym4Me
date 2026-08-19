#!/usr/bin/env node
/**
 * Migrates mobile screens from Header + back button to SecondaryPageHeader.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(__dirname, "../apps/mobile/src");

const EXCLUDE_BASENAMES = new Set([
  "AthleteHomeScreen.tsx",
  "CoachHomeScreen.tsx",
  "OwnerHomeScreen.tsx",
  "DiscoveryHomeScreen.tsx",
  "CommunityHomeScreen.tsx",
  "BaseProfileScreen.tsx",
  "AthleteBookingsScreen.tsx",
  "CoachCalendarDailyScreen.tsx",
  "CoachClientsScreen.tsx",
  "OwnerMembersScreen.tsx",
  "OwnerFinanceScreen.tsx",
  "DiscoveryClubsDetailScreen.tsx",
  "DiscoveryCoachesDetailScreen.tsx",
  "DiscoveryClubsClassDetailScreen.tsx",
  "DiscoveryClassesDetailScreen.tsx",
  "AthleteProfileEditScreen.tsx",
  "CoachProfileEditScreen.tsx",
  "OwnerProfileEditScreen.tsx",
  "OwnerClubsCreateScreen.tsx",
  "AthleteSocialCreateScreen.tsx",
  "AthleteBookingRescheduleScreen.tsx",
  "AthleteQrCheckInScreen.tsx",
  "DiscoveryCoachesReserveScreen.tsx",
  "PaymentResultScreen.tsx",
  "PaymentInvoiceScreen.tsx",
  "CoachProgramEditorScreen.tsx",
  "SetPasswordScreen.tsx",
  "theme-demo.tsx",
  "DiscoveryClubsReserveHeroSection.tsx",
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith(".tsx")) files.push(full);
  }
  return files;
}

function extractSelfClosingJsx(source, openIdx) {
  let i = openIdx + 1;
  let braceDepth = 0;
  const tagMatch = source.slice(openIdx).match(/^<([A-Za-z][\w.]*)/);
  if (!tagMatch) return null;
  const rootTag = tagMatch[1];
  let elementDepth = 1;

  while (i < source.length) {
    const ch = source[i];

    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      i += 1;
      while (i < source.length && source[i] !== quote) {
        if (source[i] === "\\") i += 1;
        i += 1;
      }
      i += 1;
      continue;
    }

    if (ch === "{") {
      braceDepth += 1;
      i += 1;
      continue;
    }

    if (ch === "}") {
      braceDepth -= 1;
      i += 1;
      continue;
    }

    if (braceDepth === 0 && ch === "<") {
      if (source.startsWith("</", i)) {
        const closeMatch = source.slice(i).match(/^<\/([A-Za-z][\w.]*)>/);
        if (closeMatch) {
          elementDepth -= 1;
          i += closeMatch[0].length;
          if (elementDepth === 0) return source.slice(openIdx, i);
          continue;
        }
      }

      const openMatch = source.slice(i).match(/^<([A-Za-z][\w.]*)/);
      if (openMatch) {
        elementDepth += 1;
        i += openMatch[0].length;
        continue;
      }
    }

    if (braceDepth === 0 && elementDepth === 1 && source.startsWith("/>", i)) {
      return source.slice(openIdx, i + 2);
    }

    i += 1;
  }

  return null;
}

function extractJsxProp(block, propName) {
  const marker = `${propName}=`;
  const idx = block.indexOf(marker);
  if (idx === -1) return null;

  let i = idx + marker.length;
  while (i < block.length && /\s/.test(block[i])) i += 1;

  if (block[i] !== "{") return null;

  let depth = 0;
  const start = i;
  for (; i < block.length; i += 1) {
    const ch = block[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return block.slice(start + 1, i);
    }
  }
  return null;
}

function hasBackButton(block) {
  return block.includes("ChevronLeft");
}

function extractOnBack(startContent) {
  const onPressMatch = startContent.match(/onPress=\{([\s\S]+?)\}\s*\n?\s*size=/);
  if (onPressMatch) return onPressMatch[1].trim();
  return "() => router.back()";
}

function convertHeaderBlock(block) {
  if (!hasBackButton(block)) return block;

  const title = extractJsxProp(block, "title");
  const endContent = extractJsxProp(block, "endContent");
  const className = extractJsxProp(block, "className");
  const startContent = extractJsxProp(block, "startContent") ?? "";
  const ariaMatch =
    startContent.match(/aria-label=\{([^}]+)\}/) ??
    startContent.match(/aria-label="([^"]+)"/);
  const onBack = extractOnBack(startContent);

  const props = [
    ariaMatch ? `backAriaLabel={${ariaMatch[1]}}` : 'backAriaLabel="Back"',
    `onBack={${onBack}}`,
    title ? `title={${title}}` : "",
    endContent ? `endContent={${endContent}}` : "",
    className ? `className={${className}}` : "",
  ]
    .filter(Boolean)
    .join("\n          ");

  return `<SecondaryPageHeader\n          ${props}\n        />`;
}

function findHeaderBlocks(source) {
  const blocks = [];
  let searchFrom = 0;

  while (true) {
    const openIdx = source.indexOf("<Header", searchFrom);
    if (openIdx === -1) break;

    const block = extractSelfClosingJsx(source, openIdx);
    if (!block) break;

    blocks.push({ start: openIdx, end: openIdx + block.length, block });
    searchFrom = openIdx + block.length;
  }

  return blocks;
}

function updateImports(source) {
  let next = source;

  if (
    next.includes("SecondaryPageHeader") &&
    !next.includes("@repo/ui/layout/SecondaryPageHeader")
  ) {
    next = next.replace(
      /^import \{ AppLayout \} from "@repo\/ui\/layout\/AppLayout";/m,
      `import { AppLayout } from "@repo/ui/layout/AppLayout";\nimport { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";`,
    );
  }

  if (!next.includes("<Header") && next.includes('@repo/ui/layout/Header"')) {
    next = next.replace(/^import \{ Header \} from "@repo\/ui\/layout\/Header";\n/m, "");
  }

  if (!next.includes("ChevronLeft") && next.includes("@repo/icons/ChevronLeft")) {
    next = next.replace(/^import \{ ChevronLeft \} from "@repo\/icons\/ChevronLeft";\n/m, "");
  }

  const withoutHeaders = next.replace(/<SecondaryPageHeader[\s\S]*?\/>/g, "");
  if (!/\bButton\b/.test(withoutHeaders) && next.includes('@heroui/react/button"')) {
    next = next.replace(/^import \{ Button \} from "@heroui\/react\/button";\n/m, "");
  }

  return next;
}

function migrateFile(source) {
  const blocks = findHeaderBlocks(source);
  if (blocks.length === 0) return source;

  let next = source;
  for (const { start, end, block } of [...blocks].reverse()) {
    const converted = convertHeaderBlock(block);
    if (converted === block) continue;
    next = next.slice(0, start) + converted + next.slice(end);
  }

  return updateImports(next);
}

const files = walk(mobileRoot).filter((file) => {
  if (EXCLUDE_BASENAMES.has(path.basename(file))) return false;
  const source = fs.readFileSync(file, "utf8");
  return source.includes("@repo/ui/layout/Header") && source.includes("ChevronLeft");
});

let changed = 0;
let failed = 0;

for (const file of files) {
  const original = fs.readFileSync(file, "utf8");
  const next = migrateFile(original);
  if (next !== original) {
    fs.writeFileSync(file, next);
    changed += 1;
    console.log("updated:", path.relative(mobileRoot, file));
  }
}

console.log(`\nDone. Updated ${changed} files. Failed ${failed}.`);
