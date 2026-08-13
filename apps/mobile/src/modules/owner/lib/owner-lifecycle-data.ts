export type OwnerLifecycleMember = {
  id: string;
  userLabel: string;
  statusLabel: string;
  remainingLabel: string;
  expiresLabel: string;
};

export type OwnerLifecycleJourney = {
  id: string;
  userLabel: string;
  segmentLabel: string;
  status: "active" | "completed" | "cancelled";
  stepLabel: string;
  nextActionLabel: string;
};

export type OwnerLifecycleView = {
  clubName: string;
  atRisk: OwnerLifecycleMember[];
  journeys: OwnerLifecycleJourney[];
  segments: { id: string; name: string; kind: string; status: string }[];
};
