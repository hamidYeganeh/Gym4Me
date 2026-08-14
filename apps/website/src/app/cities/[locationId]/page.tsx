import type { Metadata } from "next";
import { SeoCityScreen } from "@/modules/discovery/screens/SeoCityScreen";

type Props = {
  params: Promise<{ locationId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locationId } = await params;
  return {
    title: `باشگاه‌های ${locationId} | Gym4Me`,
    description: `فهرست باشگاه‌های تأییدشده در ${locationId}`,
  };
}

export default async function CitySeoPage({ params }: Props) {
  const { locationId } = await params;
  return <SeoCityScreen locationId={locationId} />;
}
