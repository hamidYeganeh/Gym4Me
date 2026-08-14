import type { Metadata } from "next";
import { PricingScreen } from "@/modules/marketing/screens/PricingScreen";

export const metadata: Metadata = {
  title: "تعرفه نرم‌افزار مدیریت باشگاه",
  description:
    "پلن‌های فعال Gym4Me برای مدیریت عضویت، رزرو، صندوق، حضور و گزارش مالی باشگاه.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return <PricingScreen />;
}
