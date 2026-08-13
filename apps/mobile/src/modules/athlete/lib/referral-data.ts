export type ReferralInviteStatus =
  | "pending"
  | "sent"
  | "joined"
  | "expired"
  | "unknown";

export type AthleteReferralInvite = {
  id: string;
  phone: string;
  status: ReferralInviteStatus;
  createdLabel: string;
};

export type AthleteReferralView = {
  referralCode: string;
  inviteUrl: string;
  stats: {
    invitesSent: number;
    invitesJoined: number;
    totalReferred: number;
  };
  invites: AthleteReferralInvite[];
};

export const DEMO_REFERRAL: AthleteReferralView = {
  referralCode: "GYM4ME",
  inviteUrl: "https://gym4me.app/auth?ref=GYM4ME",
  stats: {
    invitesSent: 4,
    invitesJoined: 2,
    totalReferred: 2,
  },
  invites: [
    {
      id: "demo-inv-1",
      phone: "0912***6789",
      status: "joined",
      createdLabel: "۳ روز پیش",
    },
    {
      id: "demo-inv-2",
      phone: "0935***1122",
      status: "pending",
      createdLabel: "دیروز",
    },
  ],
};

export function normalizeInviteStatus(raw: string): ReferralInviteStatus {
  const value = raw.toLowerCase();
  if (value === "pending" || value === "sent") return value;
  if (value === "joined" || value === "accepted") return "joined";
  if (value === "expired" || value === "revoked") return "expired";
  return "unknown";
}
