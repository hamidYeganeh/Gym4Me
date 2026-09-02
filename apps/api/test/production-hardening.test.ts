import { describe, expect, it } from "vitest";
import { observeHttp, renderMetrics } from "../src/observability/metrics.js";
import { uploadQuerySchema } from "../src/modules/upload/schemas/upload.schemas.js";

describe("production hardening", () => {
  it("does not expose object ids as Prometheus route labels", () => {
    observeHttp("GET", "/api/v1/bookings/507f1f77bcf86cd799439011", 200, 0.04);
    const output = renderMetrics();
    expect(output).toContain("/api/v1/bookings/:id");
    expect(output).not.toContain("507f1f77bcf86cd799439011");
  });

  it("prevents public verification documents", () => {
    expect(() =>
      uploadQuerySchema.parse({ purpose: "verification", visibility: "public" }),
    ).toThrow();
    expect(
      uploadQuerySchema.parse({ purpose: "verification", visibility: "private" }).visibility,
    ).toBe("private");
  });

  it("requires an organization for organization-only assets", () => {
    expect(() =>
      uploadQuerySchema.parse({ purpose: "club_gallery", visibility: "organization" }),
    ).toThrow();
  });
});
