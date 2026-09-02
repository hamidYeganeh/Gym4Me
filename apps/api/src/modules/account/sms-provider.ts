import type { AppConfig } from "../../config/app.config.js";

export interface SmsProvider {
  sendOtp(input: { receptor: string; token: string }): Promise<{ messageId?: string }>;
}

class ConsoleSmsProvider implements SmsProvider {
  async sendOtp(input: { receptor: string; token: string }) {
    process.stdout.write(`[DEV OTP] ${input.receptor}: ${input.token}\n`);
    return { messageId: `console-${Date.now()}` };
  }
}

class KavenegarSmsProvider implements SmsProvider {
  constructor(
    private readonly apiKey: string,
    private readonly template: string,
  ) {}

  async sendOtp(input: { receptor: string; token: string }) {
    const endpoint = new URL(`https://api.kavenegar.com/v1/${this.apiKey}/verify/lookup.json`);
    endpoint.searchParams.set("receptor", input.receptor);
    endpoint.searchParams.set("token", input.token);
    endpoint.searchParams.set("template", this.template);

    const response = await fetch(endpoint, { method: "POST", signal: AbortSignal.timeout(10_000) });
    const payload = (await response.json()) as {
      return?: { status?: number; message?: string };
      entries?: Array<{ messageid?: number }>;
    };
    if (!response.ok || payload.return?.status !== 200)
      throw new Error(
        `Kavenegar OTP delivery failed (${response.status}/${payload.return?.status ?? "unknown"})`,
      );
    const messageId = payload.entries?.[0]?.messageid?.toString();
    return messageId ? { messageId } : {};
  }
}

export function createSmsProvider(config: AppConfig): SmsProvider {
  if (config.OTP_PROVIDER === "kavenegar") {
    if (!config.KAVENEGAR_API_KEY) throw new Error("KAVENEGAR_API_KEY is required");
    return new KavenegarSmsProvider(config.KAVENEGAR_API_KEY, config.KAVENEGAR_OTP_TEMPLATE);
  }
  return new ConsoleSmsProvider();
}
