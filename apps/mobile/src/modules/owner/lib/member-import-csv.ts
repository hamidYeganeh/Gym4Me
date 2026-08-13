import type { ImportMembershipRow } from "@repo/api";

const HEADER_ALIASES = {
  name: new Set(["name", "full_name", "نام", "نام و نام خانوادگی"]),
  phone: new Set(["phone", "mobile", "mobile_number", "موبایل", "تلفن"]),
  planId: new Set(["plan_id", "planid", "plan", "شناسه پلن", "پلن"]),
} as const;

function parseLine(line: string): string[] {
  const cells: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      cells.push(value.trim());
      value = "";
    } else {
      value += char;
    }
  }
  cells.push(value.trim());
  return cells;
}

function headerIndex(headers: string[], aliases: ReadonlySet<string>) {
  return headers.findIndex((header) => aliases.has(header.toLowerCase()));
}

/** Parses the intentionally small CSV contract used by the members desk. */
export function parseMemberImportCsv(text: string): ImportMembershipRow[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error("CSV must include a header and at least one member");
  }

  const headers = parseLine(lines[0]);
  const nameIndex = headerIndex(headers, HEADER_ALIASES.name);
  const phoneIndex = headerIndex(headers, HEADER_ALIASES.phone);
  const planIndex = headerIndex(headers, HEADER_ALIASES.planId);
  if (nameIndex < 0 || phoneIndex < 0) {
    throw new Error("CSV requires name/نام and phone/موبایل columns");
  }

  return lines.slice(1).map((line, index) => {
    const cells = parseLine(line);
    const name = cells[nameIndex]?.trim() ?? "";
    const phone = cells[phoneIndex]?.trim() ?? "";
    if (!name || !phone) {
      throw new Error(`Row ${index + 2} requires name and phone`);
    }
    const planId = planIndex >= 0 ? cells[planIndex]?.trim() : undefined;
    return {
      rowKey: String(index + 2),
      name,
      phone,
      planId: planId || undefined,
    };
  });
}
