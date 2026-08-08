export type ValidateReferralResponse = {
  valid: true;
  referralCode: string;
  referrer: {
    name: { first: string | null; last: string | null };
    code: string | null;
  };
};

export type MyReferralResponse = {
  referralCode: string;
  stats: {
    invitesSent: number;
    invitesJoined: number;
    totalReferred: number;
  };
};

export type InviteInput = {
  phones: string[];
};

export type InviteResponse = {
  results: { phone: string; status: string }[];
};

export type ReferralInvite = {
  id: string;
  phone: string;
  status: string;
  joinedUserId: string | null;
  createdAt: string;
};
