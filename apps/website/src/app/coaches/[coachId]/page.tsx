import type { Metadata } from "next";
import { SeoCoachDetailScreen } from "@/modules/discovery/screens/SeoCoachDetailScreen";
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
  return <SeoCoachDetailScreen coachId={coachId} />;
}
