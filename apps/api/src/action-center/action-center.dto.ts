import { IsIn, IsString, MaxLength } from 'class-validator';

export const ACTION_CENTER_KINDS = [
  'athlete.booking_payment',
  'athlete.workout_resume',
  'athlete.membership_renew',
  'athlete.booking_upcoming',
  'athlete.waitlist_offer',
  'coach.booking_requests',
  'coach.student_at_risk',
  'coach.student_program',
  'owner.create_club',
  'owner.debts',
  'owner.tasks',
] as const;

export class ActionCenterClickDto {
  @IsString()
  @MaxLength(160)
  itemId!: string;

  @IsIn(ACTION_CENTER_KINDS)
  kind!: (typeof ACTION_CENTER_KINDS)[number];
}
