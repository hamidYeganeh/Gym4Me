import type {
  AthleteDataGrant,
  CreateAthleteDataGrantInput,
} from "@repo/api";
import type { CoachRelationshipOption } from "../../lib/data-grants-data";

export type AthleteDataGrantsScreenProps = {
  grants: AthleteDataGrant[];
  coaches: CoachRelationshipOption[];
  pending?: boolean;
  onCreate: (input: CreateAthleteDataGrantInput) => Promise<void>;
  onRevoke: (id: string) => Promise<void>;
};
