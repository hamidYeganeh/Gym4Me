import type { ClubCreateRuleDraft } from "../../lib/club-create-form";

export type OwnerClubsCreateRulesSectionProps = {
  rules: ClubCreateRuleDraft[];
  onAddRule: () => void;
  onRemoveRule: (id: string) => void;
  onRuleChange: (
    id: string,
    patch: Partial<Pick<ClubCreateRuleDraft, "policy" | "title" | "description">>,
  ) => void;
  className?: string;
};
