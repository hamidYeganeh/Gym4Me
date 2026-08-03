import type { MinimalCarouselCard } from "@repo/ui/kit/MinimalCarousel";
import type { OwnerHomeStat } from "../../lib/owner-home-data";

export type OwnerHomeStatsSectionProps = {
  stats: OwnerHomeStat[];
  labels: Record<
    OwnerHomeStat["titleKey"] | OwnerHomeStat["unitKey"],
    string
  >;
  copyLabel: string;
  editLabel: string;
  onCopyClick?: (card: MinimalCarouselCard) => void;
  onCustomizeClick?: (card: MinimalCarouselCard) => void;
};
