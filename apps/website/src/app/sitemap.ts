import type { MetadataRoute } from "next";
import {
  articlesApi,
  discoveryClubs,
  discoveryCoaches,
} from "@/shared/lib/api";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://gym4me.ir";

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
    ...[
      "/clubs",
      "/coaches",
      "/pricing",
      "/for-clubs",
      "/for-coaches",
      "/for-athletes",
    ].map((path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "/clubs" || path === "/coaches" ? 0.9 : 0.75,
    })),
  ];

  let clubRoutes: MetadataRoute.Sitemap = [];
  let coachRoutes: MetadataRoute.Sitemap = [];
  let articleRoutes: MetadataRoute.Sitemap = [];

  try {
    const items: Awaited<ReturnType<typeof discoveryClubs.list>>["result"] = [];
    let page = 1;
    while (page) {
      const clubs = await discoveryClubs.list({ page, page_size: 200 });
      items.push(...clubs.result);
      page = clubs.pagination.next ?? 0;
    }
    clubRoutes = items.map((club) => ({
      url: `${SITE_URL}/clubs/${club.id}`,
      lastModified: club.updatedAt ? new Date(club.updatedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    clubRoutes = [];
  }

  try {
    const items: Awaited<ReturnType<typeof discoveryCoaches.list>>["result"] =
      [];
    let page = 1;
    while (page) {
      const coaches = await discoveryCoaches.list({ page, page_size: 200 });
      items.push(...coaches.result);
      page = coaches.pagination.next ?? 0;
    }
    coachRoutes = items.map((coach) => ({
      url: `${SITE_URL}/coaches/${coach.userId}`,
      lastModified: coach.updatedAt ? new Date(coach.updatedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    coachRoutes = [];
  }

  try {
    const items: Awaited<ReturnType<typeof articlesApi.list>>["result"] = [];
    let page = 1;
    while (page) {
      const articles = await articlesApi.list({ page, page_size: 200 });
      items.push(...articles.result);
      page = articles.pagination.next ?? 0;
    }
    articleRoutes = items.map((article) => ({
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
