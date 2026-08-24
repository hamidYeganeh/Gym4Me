export const adminDiscoveryEndpoints = {
  root: "/admin/discovery/pages",
  byKey: (pageKey: string) =>
    `/admin/discovery/pages/${encodeURIComponent(pageKey)}`,
  draft: (pageKey: string) =>
    `/admin/discovery/pages/${encodeURIComponent(pageKey)}/draft`,
  preview: (pageKey: string) =>
    `/admin/discovery/pages/${encodeURIComponent(pageKey)}/preview`,
  publish: (pageKey: string) =>
    `/admin/discovery/pages/${encodeURIComponent(pageKey)}/publish`,
  rollback: (pageKey: string) =>
    `/admin/discovery/pages/${encodeURIComponent(pageKey)}/rollback`,
} as const;
