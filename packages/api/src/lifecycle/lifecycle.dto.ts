export type LifecycleSegmentKind =
  | "expiring_soon"
  | "low_credits"
  | "no_visit"
  | "incomplete_payment"
  | "trial_unconverted";

export type LifecycleJourneyStatus = "active" | "completed" | "cancelled";

export type LifecycleSegment = {
  id: string;
  clubId: string;
  kind: LifecycleSegmentKind;
  name: string;
  rule: Record<string, unknown>;
  status: "active" | "inactive";
};

export type AtRiskMemberRow = {
  id: string;
  userId: string | null;
  status: string;
  remainingSessions: number | null;
  remainingEntries: number | null;
  expiresAt: string | null;
};

export type LifecycleJourney = {
  id: string;
  clubId: string;
  userId: string;
  segmentKind: LifecycleSegmentKind;
  status: LifecycleJourneyStatus;
  step: number;
  nextActionAt: string | null;
  context: Record<string, unknown>;
};

export type LifecycleSegmentsResponse = { result: LifecycleSegment[] };

export type AtRiskMembersResponse = {
  expiringSoon: AtRiskMemberRow[];
  lowCredits: AtRiskMemberRow[];
};

export type LifecycleJourneysResponse = { result: LifecycleJourney[] };

export type EnrollJourneysResult = { enrolled: number };

export type RunJourneysResult = {
  due: number;
  sent: number;
  completed: number;
};

export type ClubBroadcastAudience = "all" | "active_members" | "at_risk";

export type ClubBroadcast = {
  id: string;
  clubId: string;
  title: string;
  body: string;
  audience: ClubBroadcastAudience;
  status: "queued";
  recipientCount: number;
  createdAt: string;
};

export type ClubBroadcastList = {
  result: ClubBroadcast[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CreateClubBroadcastInput = {
  title: string;
  body: string;
  audience: ClubBroadcastAudience;
  idempotencyKey: string;
};
