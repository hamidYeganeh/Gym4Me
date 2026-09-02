export interface HealthStatus {
  status: "ok" | string;
  service: string;
  runtime: string;
  database: string;
}
