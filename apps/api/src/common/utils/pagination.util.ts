export type PaginationMeta = {
  page: number;
  page_size: number;
  next: number | null;
  prev: number | null;
  total: number;
};

export type PaginatedResult<T> = {
  pagination: PaginationMeta;
  result: T[];
};

export function resolvePageSize(query: {
  page?: number;
  limit?: number;
  page_size?: number;
}): { page: number; pageSize: number } {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(
    200,
    Math.max(1, query.page_size ?? query.limit ?? 20),
  );
  return { page, pageSize };
}

export function paginatedResult<T>(
  result: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;
  return {
    pagination: {
      page,
      page_size: pageSize,
      next: page < totalPages ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
      total,
    },
    result,
  };
}

/** Wrap a full (non-sliced) list as a single-page paginated payload. */
export function asSinglePageResult<T>(result: T[]): PaginatedResult<T> {
  return paginatedResult(result, result.length, 1, Math.max(result.length, 1));
}
