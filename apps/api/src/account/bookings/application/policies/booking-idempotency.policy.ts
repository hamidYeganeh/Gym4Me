import { ConflictException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { BookingDocument } from '../../../../schemas/booking.schema';
import type {
  CreateBookingDto,
  CreateClubBookingDto,
} from '../../dto/booking.dto';

function digest(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function normalizedIntake(intake: CreateBookingDto['intake']) {
  return {
    note: intake?.note ?? null,
    medicalConditionKeys: [...(intake?.medicalConditionKeys ?? [])].sort(),
    supplementKeys: [...(intake?.supplementKeys ?? [])].sort(),
  };
}

export function coachBookingFingerprint(
  athleteId: string,
  dto: CreateBookingDto,
): string {
  return digest({
    version: 1,
    kind: 'coach',
    athleteId,
    coachUserId: dto.coachUserId,
    slotId: dto.slotId,
    consultationKind: dto.consultationKind,
    intake: normalizedIntake(dto.intake),
    couponCode: dto.couponCode ?? null,
  });
}

export function clubBookingFingerprint(
  athleteId: string,
  dto: CreateClubBookingDto,
): string {
  return digest({
    version: 1,
    kind: 'club',
    athleteId,
    clubId: dto.clubId,
    slotId: dto.slotId,
    dates: [...new Set(dto.dates)].sort(),
    attendeeCount: dto.attendeeCount ?? 1,
    intake: normalizedIntake(dto.intake),
    couponCode: dto.couponCode ?? null,
  });
}

/** A retry key may replay only the exact request that originally claimed it. */
export function assertMatchingBookingFingerprint(
  bookings: BookingDocument[],
  expected: string,
): void {
  const mismatch = bookings.some(
    (booking) =>
      booking.idempotencyFingerprint !== undefined &&
      booking.idempotencyFingerprint !== expected,
  );
  if (mismatch) {
    throw new ConflictException(
      'Idempotency key was already used with a different booking payload',
    );
  }
}
