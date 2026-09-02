import "./load-env.js";
import { z } from "zod";

const envBoolean = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  if (["true", "1"].includes(value.toLowerCase())) return true;
  if (["false", "0"].includes(value.toLowerCase())) return false;
  return value;
}, z.boolean());
const optionalSecret = (minimum: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && !value.trim() ? undefined : value),
    z.string().min(minimum).optional(),
  );

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    API_HOST: z.string().default("0.0.0.0"),
    API_PORT: z.coerce.number().positive().default(4000),
    MONGODB_URI: z.string().min(1),
    REDIS_URL: z.string().default("redis://localhost:6379"),
    JWT_ACCESS_SECRET: z.string().min(32),
    ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().positive().default(900),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().positive().default(30),
    OTP_TTL_SECONDS: z.coerce.number().positive().default(120),
    OTP_MAX_ATTEMPTS: z.coerce.number().positive().default(5),
    OTP_PROVIDER: z.enum(["console", "kavenegar"]).default("console"),
    KAVENEGAR_API_KEY: z.string().optional(),
    KAVENEGAR_OTP_TEMPLATE: z.string().default("gym4meotp"),
    CORS_ALLOWED_ORIGINS: z
      .string()
      .default("http://localhost:3000,http://localhost:3001,http://localhost:3002"),
    TRUST_PROXY: envBoolean.default(false),
    SWAGGER_ENABLED: envBoolean.optional(),
    METRICS_TOKEN: optionalSecret(24),
    REQUEST_BODY_LIMIT_BYTES: z.coerce
      .number()
      .int()
      .min(16_384)
      .max(10_485_760)
      .default(1_048_576),
    RATE_LIMIT_PER_MINUTE: z.coerce.number().int().min(10).max(10_000).default(120),
  })
  .superRefine((value, context) => {
    if (value.OTP_PROVIDER === "kavenegar" && !value.KAVENEGAR_API_KEY)
      context.addIssue({
        code: "custom",
        path: ["KAVENEGAR_API_KEY"],
        message: "Required for Kavenegar OTP",
      });
    if (value.NODE_ENV === "production") {
      if (value.OTP_PROVIDER === "console")
        context.addIssue({
          code: "custom",
          path: ["OTP_PROVIDER"],
          message: "Console OTP is forbidden in production",
        });
      if (value.JWT_ACCESS_SECRET.startsWith("replace-with"))
        context.addIssue({
          code: "custom",
          path: ["JWT_ACCESS_SECRET"],
          message: "Placeholder secrets are forbidden in production",
        });
      if (!value.CORS_ALLOWED_ORIGINS.trim())
        context.addIssue({
          code: "custom",
          path: ["CORS_ALLOWED_ORIGINS"],
          message: "At least one production origin is required",
        });
      if (!value.METRICS_TOKEN)
        context.addIssue({
          code: "custom",
          path: ["METRICS_TOKEN"],
          message: "Required in production",
        });
    }
  });

export type AppConfig = z.infer<typeof schema>;
let cached: AppConfig | undefined;

export function validateEnv(env: Record<string, unknown>): AppConfig {
  return schema.parse(env);
}

export function appConfig(): AppConfig {
  return (cached ??= validateEnv(process.env));
}
