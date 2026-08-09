export type ClubCreateCatalogOption = {
  id: string;
  name: string;
};

export type OwnerClubsCreateCatalogSectionProps = {
  title: string;
  hint: string;
  isLoading: boolean;
  options: ClubCreateCatalogOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  className?: string;
};
