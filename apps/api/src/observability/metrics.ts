type Labels = Record<string, string>;

const startedAt = Date.now();
const requests = new Map<string, number>();
const durations = new Map<string, { count: number; sum: number }>();

const escapeLabel = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
const labelText = (labels: Labels) =>
  `{${Object.entries(labels)
    .map(([key, value]) => `${key}="${escapeLabel(value)}"`)
    .join(",")}}`;

export function observeHttp(
  method: string,
  route: string,
  status: number,
  durationSeconds: number,
) {
  const normalizedRoute =
    route.split("?")[0]?.replace(/\/[a-f\d]{24}(?=\/|$)/gi, "/:id") ?? "unknown";
  const key = JSON.stringify({ method, route: normalizedRoute, status: String(status) });
  requests.set(key, (requests.get(key) ?? 0) + 1);
  const durationKey = JSON.stringify({ method, route: normalizedRoute });
  const current = durations.get(durationKey) ?? { count: 0, sum: 0 };
  current.count += 1;
  current.sum += durationSeconds;
  durations.set(durationKey, current);
}

export function renderMetrics() {
  const lines = [
    "# HELP gym4me_api_uptime_seconds Process uptime in seconds.",
    "# TYPE gym4me_api_uptime_seconds gauge",
    `gym4me_api_uptime_seconds ${(Date.now() - startedAt) / 1000}`,
    "# HELP gym4me_http_requests_total Total HTTP requests.",
    "# TYPE gym4me_http_requests_total counter",
  ];
  for (const [key, value] of requests)
    lines.push(`gym4me_http_requests_total${labelText(JSON.parse(key))} ${value}`);
  lines.push(
    "# HELP gym4me_http_request_duration_seconds HTTP request duration.",
    "# TYPE gym4me_http_request_duration_seconds summary",
  );
  for (const [key, value] of durations) {
    const labels = labelText(JSON.parse(key));
    lines.push(`gym4me_http_request_duration_seconds_count${labels} ${value.count}`);
    lines.push(`gym4me_http_request_duration_seconds_sum${labels} ${value.sum}`);
  }
  lines.push(
    "# HELP process_resident_memory_bytes Resident memory size.",
    "# TYPE process_resident_memory_bytes gauge",
    `process_resident_memory_bytes ${process.memoryUsage().rss}`,
  );
  return `${lines.join("\n")}\n`;
}
