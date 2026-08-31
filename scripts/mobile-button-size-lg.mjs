#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MOBILE_SRC = path.join(ROOT, "apps/mobile/src");

function patchButtonTags(content) {
  let result = "";
  let i = 0;

  while (i < content.length) {
    const start = content.indexOf("<Button", i);
    if (start === -1) {
      result += content.slice(i);
      break;
    }

    result += content.slice(i, start);
    let j = start + "<Button".length;
    let depth = 0;
    while (j < content.length) {
      const ch = content[j];
      if (ch === "{") depth++;
      else if (ch === "}") depth = Math.max(0, depth - 1);
      else if (ch === ">" && depth === 0) {
        j++;
        break;
      }
      j++;
    }

    let tag = content.slice(start, j);
    tag = tag.replace(/\ssize="(?:sm|md|xs)"/g, ' size="lg"');
    if (!/\ssize=/.test(tag)) {
      tag = tag.replace("<Button", '<Button size="lg"');
    }
    result += tag;
    i = j;
  }

  return result;
}

function walk(dir) {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "dev") continue;
      count += walk(full);
    } else if (entry.name.endsWith(".tsx")) {
      const content = fs.readFileSync(full, "utf8");
      if (!content.includes("<Button")) continue;
      const next = patchButtonTags(content);
      if (next !== content) {
        fs.writeFileSync(full, next);
        count++;
      }
    }
  }
  return count;
}

console.log(`Updated ${walk(MOBILE_SRC)} tsx files`);
