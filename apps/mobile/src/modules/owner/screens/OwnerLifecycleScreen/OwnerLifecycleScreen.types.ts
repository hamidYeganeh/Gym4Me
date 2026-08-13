import type { OwnerLifecycleView } from "../../lib/owner-lifecycle-data";

export type OwnerLifecycleScreenProps = {
  view: OwnerLifecycleView;
  pending?: boolean;
  onEnroll?: () => void;
  onRun?: () => void;
  className?: string;
};
