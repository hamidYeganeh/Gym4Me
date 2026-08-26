export const inventoryEndpoints = {
  list: (clubId: string) => `/account/clubs/${clubId}/inventory`,
  item: (clubId: string, itemId: string) =>
    `/account/clubs/${clubId}/inventory/${itemId}`,
} as const;
