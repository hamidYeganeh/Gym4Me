export type DiscoveryLocationSectionTarget = "map" | "clubs" | "coaches";

export type DiscoveryLocationSectionProps = {
  target: DiscoveryLocationSectionTarget;
  title: string;
  subtitle: string;
  ctaLabel: string;
  provinceLabel: string;
  cityLabel: string;
  districtLabel: string;
  provinceEmptyLabel: string;
  cityEmptyLabel: string;
  districtEmptyLabel: string;
  cityNeedsProvinceLabel: string;
  districtNeedsCityLabel: string;
};
