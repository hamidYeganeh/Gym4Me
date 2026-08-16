import type { DiscoveryAddressItem } from "../../lib/discovery-addresses-data";

export type DiscoveryLocationSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  addresses: DiscoveryAddressItem[];
  selectedId: string;
  onSelect: (addressId: string) => void;
  onAddNew?: () => void;
  title: string;
  description: string;
  emptyLabel: string;
  addLabel: string;
  updateLabel: string;
  closeLabel: string;
};
