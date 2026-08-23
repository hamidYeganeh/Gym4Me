import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteSocialPostGate } from "@/modules/athlete/lib/AthleteSocialPostGate";
import { DEMO_SOCIAL_POSTS } from "@/modules/athlete/lib/social-feed-data";
import {
  buildDemoStaticParams,
  STATIC_EXPORT_PLACEHOLDER_ID,
} from "@/shared/lib/runtime-mode";

type SocialPostPageProps = {
  params: Promise<{ postId: string }>;
};

export function generateStaticParams() {
  return buildDemoStaticParams(
    () => DEMO_SOCIAL_POSTS.map(({ id: postId }) => ({ postId })),
    [{ postId: STATIC_EXPORT_PLACEHOLDER_ID }],
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteSocial");
  return { title: t("detailPageTitle") };
}

export default async function AthleteSocialPostPage({
  params,
}: SocialPostPageProps) {
  const { postId } = await params;
  return <AthleteSocialPostGate postId={postId} />;
}
