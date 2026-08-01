export type DiscoveryClubsDetailHeroSectionLightboxProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  images: string[];
  activeIndex: number;
  onSelectImage: (index: number) => void;
};
