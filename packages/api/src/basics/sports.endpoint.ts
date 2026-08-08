/** Public sport hierarchy (`/basics/ref`). */
export const basicsSportsEndpoints = {
  categories: "/basics/ref/sport-category",
  categoryById: (id: string) => `/basics/ref/sport-category/${id}`,
  categorySports: (categoryId: string) =>
    `/basics/ref/sport-category/${categoryId}/sports`,
  sports: "/basics/ref/sport",
  sportById: (id: string) => `/basics/ref/sport/${id}`,
  sportBranches: (sportId: string) => `/basics/ref/sport/${sportId}/branches`,
  branches: "/basics/ref/sport-branch",
  branchById: (id: string) => `/basics/ref/sport-branch/${id}`,
} as const;
