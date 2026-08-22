import { describe, expect, it } from "@jest/globals";
import {
  createAuthLoginPasswordFormSchema,
  toAuthLoginOtpRequestPayload,
  toAuthLoginPasswordPayload,
} from "./AuthLoginPasswordForm.schema";

const schema = createAuthLoginPasswordFormSchema({
  passwordRequired: "رمز عبور الزامی است",
  phoneInvalid: "شماره موبایل معتبر نیست",
  phoneRequired: "شماره موبایل الزامی است",
});

describe("admin login form contract", () => {
  it("normalizes Persian digits before calling the API", () => {
    const values = schema.parse({
      password: "secret",
      phone: "۰۹۳۸ ۳۷۲ ۹۶۲۷",
      remember: true,
    });

    expect(toAuthLoginPasswordPayload(values)).toEqual({
      password: "secret",
      phone: "+989383729627",
      remember: true,
    });
    expect(toAuthLoginOtpRequestPayload(values.phone)).toEqual({
      phone: "+989383729627",
    });
  });

  it("rejects an invalid phone and an empty password", () => {
    const result = schema.safeParse({
      password: "",
      phone: "02112345678",
      remember: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual([
        "شماره موبایل معتبر نیست",
        "رمز عبور الزامی است",
      ]);
    }
  });
});
