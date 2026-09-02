import { describe, expect, it } from "vitest";
import { can } from "../src/security/rbac.js";

describe("RBAC scope policy", () => {
  it("allows a global wildcard", () => {
    expect(
      can({ userId: "u1", permissionCodes: ["*"], scopeType: "global" }, "admin.users.manage"),
    ).toBe(true);
  });

  it("rejects a branch permission outside its scope", () => {
    expect(
      can(
        {
          userId: "u1",
          permissionCodes: ["branch.booking.read"],
          scopeType: "branch",
          scopeId: "b1",
        },
        "branch.booking.read",
        { branchId: "b2" },
      ),
    ).toBe(false);
  });
});
