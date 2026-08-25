import type { CoachVerificationItem } from "@repo/api";

export type CoachVerificationsReviewDialogSectionProps = {
  review: { item: CoachVerificationItem; action: "approve" | "reject" } | null;
  reviewNote: string;
  onReviewNoteChange: (value: string) => void;
  credential: {
    typeKey: string;
    issuer: string;
    issuedAt: string;
    expiresAt: string;
  };
  onCredentialChange: (
    field: "typeKey" | "issuer" | "issuedAt" | "expiresAt",
    value: string,
  ) => void;
  pending: boolean;
  reviewError: string | null;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
};
