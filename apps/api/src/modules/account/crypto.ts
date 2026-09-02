import { createHash, randomBytes, randomInt } from "node:crypto";

export function randomOtp(): string {
  return randomInt(100000, 1000000).toString();
}

export function randomToken(bytes = 48): string {
  return randomBytes(bytes).toString("base64url");
}

export function secureHash(value: string, secret: string): string {
  return createHash("sha256").update(`${secret}:${value}`).digest("hex");
}
