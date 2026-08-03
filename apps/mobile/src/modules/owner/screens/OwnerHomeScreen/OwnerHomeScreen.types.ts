import type {
  OwnerHomeClub,
  OwnerHomeStat,
} from "../../lib/owner-home-data";

export type OwnerHomeScreenProps = {
  stats: OwnerHomeStat[];
  clubs: OwnerHomeClub[];
};
