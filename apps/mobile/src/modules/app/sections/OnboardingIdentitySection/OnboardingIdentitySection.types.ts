import type { OnboardingGenderId } from "@/modules/app/lib/onboarding-data";
import type { LocationPickerLatLng } from "@repo/ui/kit/LocationPickerMap";

export type OnboardingIdentityValue = {
  fullName: string;
  gender: OnboardingGenderId | null;
  nationalId: string;
  birthdateDisplay: string;
  phone: string;
  provinceId: string | null;
  provinceName: string;
  street: string;
  apartment: string;
  city: string;
  postalCode: string;
  allergies: string[];
  conditions: string;
  medications: string;
  heightCm: number;
  weightKg: number;
  note: string;
  mapPoint: LocationPickerLatLng | null;
};

export type OnboardingProvinceOption = {
  id: string;
  name: string;
};

export type OnboardingIdentityLabels = {
  title: string;
  general: string;
  address: string;
  health: string;
  fullName: string;
  gender: string;
  nationalId: string;
  birthdate: string;
  phone: string;
  province: string;
  street: string;
  apartment: string;
  city: string;
  postalCode: string;
  allergies: string;
  edit: string;
  conditions: string;
  medications: string;
  height: string;
  weight: string;
  note: string;
  selectProvinceTitle: string;
  selectProvinceAction: string;
  editAddressTitle: string;
  addressSearch: string;
  zoomIn: string;
  zoomOut: string;
  zoom: string;
  securityNote: string;
  genderOptions: Record<OnboardingGenderId, string>;
};

export type OnboardingIdentitySectionProps = {
  value: OnboardingIdentityValue;
  labels: OnboardingIdentityLabels;
  provinces: OnboardingProvinceOption[];
  onChange: (patch: Partial<OnboardingIdentityValue>) => void;
  className?: string;
};
