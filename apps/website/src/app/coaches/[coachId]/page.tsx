import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/modules/discovery/lib/JsonLd";
import { SeoCoachDetailScreen } from "@/modules/discovery/screens/SeoCoachDetailScreen";
import {
  PublicSiteFooter,
  PublicSiteHeader,
} from "@/modules/discovery/components/PublicSiteHeader";
import { discoveryCoaches, mediaFileUrl } from "@/shared/lib/api";

type Props = {
  params: Promise<{ coachId: string }>;
};

function coachName(coach: Awaited<ReturnType<typeof discoveryCoaches.get>>) {
  return (
    [coach.user.name.first, coach.user.name.last].filter(Boolean).join(" ") ||
    "مربی"
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { coachId } = await params;
  try {
    const coach = await discoveryCoaches.get(coachId);
    const name = coachName(coach);
    const image = mediaFileUrl(coach.user.avatar.mediaId) ?? undefined;
    return {
      title: `${name} | Gym4Me`,
      description: coach.bio ?? coach.experience.headline ?? undefined,
      openGraph: {
        title: name,
        description: coach.bio ?? coach.experience.headline ?? undefined,
        type: "profile",
        images: image ? [{ url: image }] : undefined,
      },
    };
  } catch {
    return { title: "مربی | Gym4Me" };
  }
}

export default async function CoachSeoPage({ params }: Props) {
  const { coachId } = await params;
  try {
    const coach = await discoveryCoaches.get(coachId);
    const name = coachName(coach);
    const image = mediaFileUrl(coach.user.avatar.mediaId) ?? undefined;

    return (
      <>
        <PublicSiteHeader />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Person",
            name,
            description: coach.bio ?? coach.experience.headline ?? undefined,
            image,
            jobTitle: "Coach",
            url: `/coaches/${coach.userId}`,
            worksFor: (coach.clubs ?? []).map((club) => ({
              "@type": "SportsActivityLocation",
              name: club.name,
              url: `/clubs/${club.id}`,
            })),
          }}
        />
        <SeoCoachDetailScreen coach={coach} />
        <PublicSiteFooter />
      </>
    );
  } catch {
    notFound();
  }
}
