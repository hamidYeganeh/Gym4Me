const baseUrl = (process.env.BASE_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "");
const paths = ["/health/live", "/health", "/catalog/branches?page=1&limit=1"];
for (const path of paths) {
  const response = await fetch(`${baseUrl}${path}`, { signal: AbortSignal.timeout(5_000) });
  if (!response.ok) throw new Error(`Smoke check failed: ${path} returned ${response.status}`);
  process.stdout.write(`ok ${path}\n`);
}
