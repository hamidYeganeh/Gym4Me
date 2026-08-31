#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MOBILE_SRC = path.join(ROOT, "apps/mobile/src");

const BUTTON_SLOT =
  /(?:Button|submit|continueSoft?|navBack|navNext|payCta|footerButton|bookButton|confirm|retry|signOut|altButton|backButton|captureButton|actionButton|filterButton|addButton|updateButton|removeButton|acceptButton|rejectButton|stepButton|metricButton|viewButton|biometricButton|suffixButton|topicButton|notifyButton|searchButton|pickerButton|weekButton|navButton|saveButton|loadMore|createPost|rowPressable|optionRow|staffCard|clubCard|kindChipButton|mapCta|editLink|secondaryAction|permission|uploadBtn|follow|preset|slot|cta)$/i;

function shouldStripToken(token) {
  if (!token) return false;
  const t = token.replace(/^!+/, "");
  if (/^rounded(?:-\[|-\w|$)/.test(t)) return true;
  if (/^h-(?:\[|\d)/.test(t)) return true;
  if (/^min-h-/.test(t)) return true;
  if (/^max-h-/.test(t)) return true;
  if (/^p(?:x|y|t|b|s|e)?-/.test(t)) return true;
  if (/^size-\d/.test(t)) return true;
  return false;
}

function stripButtonClasses(classString) {
  return classString
    .split(/\s+/)
    .filter((token) => token.length > 0 && !shouldStripToken(token))
    .join(" ")
    .trim();
}

function processClassValue(value) {
  if (value.includes("${")) return value;
  return stripButtonClasses(value);
}

function processStylesContent(content) {
  let changed = false;

  const updated = content.replace(
    /(^[\t ]*)([\w]+):\s*(?:(\[([\s\S]*?)\])|"([^"]*)"|'([^']*)')/gm,
    (match, indent, key, _arrayWrap, arrayContent, dQuote, sQuote) => {
      if (!BUTTON_SLOT.test(key)) return match;

      if (arrayContent !== undefined) {
        const parts = [...arrayContent.matchAll(/"((?:\\.|[^"\\])*)"/g)].map(
          (m) => m[1],
        );
        if (parts.length === 0) return match;
        const stripped = parts.map(processClassValue).filter(Boolean);
        if (stripped.join("|") === parts.join("|")) return match;
        changed = true;
        const body = stripped.map((p) => `${indent}  "${p}"`).join(",\n");
        return `${indent}${key}: [\n${body},\n${indent}]`;
      }

      const original = dQuote ?? sQuote ?? "";
      const stripped = processClassValue(original);
      if (stripped === original) return match;
      changed = true;
      return `${indent}${key}: "${stripped}"`;
    },
  );

  return changed ? updated : null;
}

function walk(dir, ext, processor) {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "dev") continue;
      count += walk(full, ext, processor);
    } else if (entry.name.endsWith(ext)) {
      const result = processor(full);
      if (result) count++;
    }
  }
  return count;
}

const styleCount = walk(MOBILE_SRC, ".styles.ts", (file) => {
  const content = fs.readFileSync(file, "utf8");
  const next = processStylesContent(content);
  if (next) {
    fs.writeFileSync(file, next);
    return true;
  }
  return false;
});

console.log(`Updated ${styleCount} style files`);
