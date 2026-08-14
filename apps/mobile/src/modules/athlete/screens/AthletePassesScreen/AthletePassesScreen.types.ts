import type {
  AthletePass,
  PassKind,
  PassOffer,
} from "../../lib/athlete-passes-data";

export type AthletePassesScreenProps = {
  owned: AthletePass[];
  offers: PassOffer[];
  activeKind: PassKind;
  pending?: boolean;
  message?: string | null;
  onKindChange: (kind: PassKind) => void;
  onClaim?: (offerId: string) => void | Promise<void>;
  className?: string;
};
