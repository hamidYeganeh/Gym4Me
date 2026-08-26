export type ActionCenterKind =
  | "athlete.booking_payment"
  | "athlete.workout_resume"
  | "athlete.membership_renew"
  | "athlete.booking_upcoming"
  | "athlete.waitlist_offer"
  | "coach.booking_requests"
  | "coach.student_at_risk"
  | "coach.student_program"
  | "owner.create_club"
  | "owner.debts"
  | "owner.booking_queue"
  | "owner.renewal_risk"
  | "owner.tasks";

export type ActionCenterItem = {
  id: string;
  kind: ActionCenterKind;
  priority: number;
  href: string;
  entityId: string | null;
  dueAt: string | null;
  params: Record<string, string | number>;
};

export type ActionCenterResult = {
  generatedAt: string;
  elapsedMs: number;
  items: ActionCenterItem[];
};
