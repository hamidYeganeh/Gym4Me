import { config } from "dotenv";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function findRepoRoot(start: string): string {
  let dir = start;
  while (true) {
    const parent = dirname(dir);
    if (parent === dir) break;
    if (existsSync(join(dir, "turbo.json"))) return dir;
    dir = parent;
  }
  throw new Error("Gym4Me monorepo root not found");
}

const repoRoot = findRepoRoot(dirname(fileURLToPath(import.meta.url)));

for (const file of [".env", ".env.local"]) {
  const envPath = join(repoRoot, file);
  if (existsSync(envPath)) {
    config({ path: envPath, override: false });
  }
}
