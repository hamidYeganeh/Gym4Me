import type {
  AddChildInput,
  ChildProfile,
} from "../../lib/athlete-family-data";

export type AthleteFamilyAccountsScreenProps = {
  childProfiles: ChildProfile[];
  pending?: boolean;
  message?: string | null;
  error?: string | null;
  onAddChild: (input: AddChildInput) => void | Promise<void>;
  className?: string;
};
