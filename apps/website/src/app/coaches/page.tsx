import type { Metadata } from "next";
import { SeoCoachesListScreen } from "@/modules/discovery/screens/SeoCoachesListScreen";

export const metadata: Metadata = {
  title: "مربی‌های ورزشی تأییدشده",
  description:
    "مربی‌های تأییدشده را بر اساس تخصص، سابقه، نوع جلسه و باشگاه محل فعالیت مقایسه کنید.",
  alternates: { canonical: "/coaches" },
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function CoachesPage({ searchParams }: Props) {
  const { q } = await searchParams;
  return <SeoCoachesListScreen q={q} />;
}
