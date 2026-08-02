import { BadRequestException } from '@nestjs/common';

export const IR_PHONE = /^\+989\d{9}$/;

/** Normalizes Iranian mobile numbers to E.164, e.g. +989383729627 */
export function normalizeIranPhone(input: unknown): string {
  if (typeof input !== 'string') {
    throw new BadRequestException('Invalid phone number');
  }
  // Convert Persian/Arabic digits, strip separators
  const digits = input
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[\s()-]/g, '');

  if (IR_PHONE.test(digits)) return digits;
  if (/^09\d{9}$/.test(digits)) return `+98${digits.slice(1)}`;
  if (/^989\d{9}$/.test(digits)) return `+${digits}`;
  if (/^00989\d{9}$/.test(digits)) return `+${digits.slice(2)}`;
  if (/^9\d{9}$/.test(digits)) return `+98${digits}`;

  throw new BadRequestException('Invalid phone number');
}
