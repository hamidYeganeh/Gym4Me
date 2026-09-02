import { access, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const output = path.join(root, "out");
const required = ["index.html", "splash.html", "auth.html", "discovery.html"];

await Promise.all(
  required.map(async (file) => {
    try {
      await access(path.join(output, file), constants.R_OK);
    } catch {
      throw new Error(`Mobile static export is incomplete: out/${file} is missing.`);
    }
  }),
);

const chunks = await readdir(path.join(output, "_next", "static", "chunks"));
if (!chunks.some((file) => file.endsWith(".js")))
  throw new Error("Mobile static export is incomplete: no JavaScript chunks were emitted.");

console.log(`Verified mobile static export (${required.length} entry routes + JS chunks).`);
