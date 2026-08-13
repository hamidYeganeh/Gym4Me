import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/modules/discovery/lib/JsonLd";
import { SeoClubDetailScreen } from "@/modules/discovery/screens/SeoClubDetailScreen";
import {
  PublicSiteFooter,
  PublicSiteHeader,
} from "@/modules/discovery/components/PublicSiteHeader";
import { discoveryClubs, mediaFileUrl, membershipsApi } from "@/shared/lib/api";

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
  try {
    const [club, reviewsPage, plansPage] = await Promise.all([
      discoveryClubs.get(clubId),
      discoveryClubs.listReviews(clubId, { page_size: 10 }).catch(() => null),
      membershipsApi
        .listPublicClubPlans(clubId, { page_size: 20 })
        .catch(() => null),
    ]);
    const image =
      mediaFileUrl(club.identity.coverMediaId) ??
      mediaFileUrl(club.gallery[0]?.mediaId) ??
      undefined;

    return (
      <>
        <PublicSiteHeader />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "SportsActivityLocation",
            name: club.identity.name,
            description: club.identity.description ?? undefined,
            image,
            address: club.location?.address
              ? {
                  "@type": "PostalAddress",
                  streetAddress: club.location.address,
                }
              : undefined,
            geo: club.location?.point
              ? {
                  "@type": "GeoCoordinates",
                  latitude: club.location.point.lat,
                  longitude: club.location.point.lng,
                }
              : undefined,
            aggregateRating:
              club.reviewsSummary.count > 0
                ? {
                    "@type": "AggregateRating",
                    ratingValue: club.reviewsSummary.average,
                    reviewCount: club.reviewsSummary.count,
                  }
                : undefined,
            url: `/clubs/${club.id}`,
          }}
        />
        <SeoClubDetailScreen
          club={club}
          plans={plansPage?.result ?? []}
          reviews={reviewsPage?.result ?? []}
        />
        <PublicSiteFooter />
      </>
    );
  } catch {
    notFound();
  }
}
