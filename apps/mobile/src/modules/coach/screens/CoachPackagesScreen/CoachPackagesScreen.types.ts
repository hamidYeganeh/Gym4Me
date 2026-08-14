import type {
  CoachSessionPackage,
  CoachSoldPackage,
} from "../../lib/coach-packages-data";

export type CoachPackageCreateInput = {
  title: string;
  sessionCount: number;
  priceLabel: string;
};

export type CoachPackagesScreenProps = {
  packages: CoachSessionPackage[];
  soldPackages: CoachSoldPackage[];
  creating?: boolean;
  onCreatePackage?: (input: CoachPackageCreateInput) => void | Promise<void>;
};
