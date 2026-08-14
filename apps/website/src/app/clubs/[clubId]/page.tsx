import type { Metadata } from "next";
import { SeoClubDetailScreen } from "@/modules/discovery/screens/SeoClubDetailScreen";
import { discoveryClubs, mediaFileUrl } from "@/shared/lib/api";

type Props = {
  params: Promise<{ clubId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clubId } = await params;
  try {
    const club = await discoveryClubs.get(clubId);
    const image =
      mediaFileUrl(club.identity.coverMediaId) ??
      mediaFileUrl(club.gallery[0]?.mediaId) ??
      undefined;
    return {
      title: `${club.identity.name} | Gym4Me`,
      description: club.identity.description ?? undefined,
      openGraph: {
        title: club.identity.name,
        description: club.identity.description ?? undefined,
        type: "website",
        images: image ? [{ url: image }] : undefined,
      },
    };
  } catch {
    return { title: "باشگاه | Gym4Me" };
  }
}

export default async function ClubSeoPage({ params }: Props) {
  const { clubId } = await params;
  return <SeoClubDetailScreen clubId={clubId} />;
}
