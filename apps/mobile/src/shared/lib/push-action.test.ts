import { parsePushAction } from "./push-action";

describe("push action", () => {
  it("accepts known internal notification targets", () => {
    expect(parsePushAction("/athlete/bookings/507f1f77bcf86cd799439011")).toBe(
      "/athlete/bookings/507f1f77bcf86cd799439011",
    );
    expect(parsePushAction("/athlete/waitlist")).toBe("/athlete/waitlist");
  });

  it("rejects external, traversal and unknown routes", () => {
    expect(parsePushAction("https://evil.example/athlete/bookings")).toBeNull();
    expect(parsePushAction("/athlete/../admin/users")).toBeNull();
    expect(parsePushAction("/owner/finance")).toBeNull();
    expect(parsePushAction({ url: "/athlete/bookings" })).toBeNull();
  });
});
