import type { ClubCreateCatalogSelectionDraft } from "@/modules/owner/lib/club-create-form";

export type ClubCreateCatalogOption = {
  id: string;
  name: string;
  icon?: string | null;
};

export type OwnerClubsCreateCatalogSectionProps = {
  title: string;
  hint: string;
  isLoading: boolean;
  options: ClubCreateCatalogOption[];
  selections: ClubCreateCatalogSelectionDraft[];
  supportsQuantity?: boolean;
  onChange: (items: ClubCreateCatalogSelectionDraft[]) => void;
  className?: string;
};
