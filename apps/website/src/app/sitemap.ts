import type { MetadataRoute } from "next";
import {
  articlesApi,
  discoveryClubs,
  discoveryCoaches,
} from "@/shared/lib/api";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://gym4me.ir";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/articles`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  let clubRoutes: MetadataRoute.Sitemap = [];
  let coachRoutes: MetadataRoute.Sitemap = [];
  let articleRoutes: MetadataRoute.Sitemap = [];

  try {
    const clubs = await discoveryClubs.list({ page_size: 100 });
    clubRoutes = clubs.result.map((club) => ({
      url: `${SITE_URL}/clubs/${club.id}`,
      lastModified: club.updatedAt ? new Date(club.updatedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    clubRoutes = [];
  }

  try {
    const coaches = await discoveryCoaches.list({ page_size: 100 });
    coachRoutes = coaches.result.map((coach) => ({
      url: `${SITE_URL}/coaches/${coach.userId}`,
      lastModified: coach.updatedAt ? new Date(coach.updatedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    coachRoutes = [];
  }

  try {
    const articles = await articlesApi.list({ page_size: 100 });
    articleRoutes = articles.result.map((article) => ({
      url: `${SITE_URL}/articles/${article.slug}`,
      lastModified: article.updatedAt ? new Date(article.updatedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    articleRoutes = [];
  }

  return [...staticRoutes, ...clubRoutes, ...coachRoutes, ...articleRoutes];
}
