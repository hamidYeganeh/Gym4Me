import type { Metadata } from "next";
import { SeoClubsListScreen } from "@/modules/discovery/screens/SeoClubsListScreen";

export const metadata: Metadata = {
  title: "فهرست باشگاه‌های تأییدشده",
  description:
    "باشگاه‌های ورزشی تأییدشده را بر اساس نام، رشته، امکانات و امتیاز پیدا و مقایسه کنید.",
  alternates: { canonical: "/clubs" },
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ClubsPage({ searchParams }: Props) {
  const { q } = await searchParams;
  return <SeoClubsListScreen q={q} />;
}
