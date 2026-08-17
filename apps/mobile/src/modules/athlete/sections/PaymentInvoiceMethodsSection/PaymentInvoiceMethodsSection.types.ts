import type { ReactNode } from "react";
import type { PaymentMethodId } from "../../screens/PaymentInvoiceScreen/PaymentInvoiceScreen.types";

export type PaymentInvoiceMethodsSectionProps = {
  methods: {
    id: PaymentMethodId;
    icon: ReactNode;
    title: string;
    hint: string;
  }[];
  selectedMethod: PaymentMethodId;
  onSelectMethod: (method: PaymentMethodId) => void;
  className?: string;
};
