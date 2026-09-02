import { describe, expect, it } from "vitest";
import { selectBusinessAssignment } from "./auth-policy";
import { jalali, money, profile, status } from "./entity";

describe("business panel policies", () => {
  it("selects the owner context before lower privilege staff contexts", () => {
    const selected = selectBusinessAssignment([
      { assignment_id: "a", role_id: "r1", role_code: "reception", scope_type: "branch", scope_id: "b", permissions: [] },
      { assignment_id: "b", role_id: "r2", role_code: "club_owner", scope_type: "organization", scope_id: "o", permissions: [] },
    ]);
    expect(selected?.role_code).toBe("club_owner");
    expect(selected?.scope_id).toBe("o");
  });

  it("rejects athlete-only sessions", () => {
    expect(selectBusinessAssignment([{ assignment_id: "a", role_id: "r", role_code: "athlete", scope_type: "self", permissions: [] }])).toBeNull();
  });

  it("formats IRR without implicit toman conversion", () => {
    expect(money("120000", "IRR")).toContain("ریال");
  });

  it("handles sparse API entities safely", () => {
    expect(profile({})).toEqual({});
    expect(status({})).toBe("unknown");
    expect(jalali(undefined)).toBe("—");
  });
});
