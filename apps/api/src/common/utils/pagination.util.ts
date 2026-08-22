export type PaginationMeta = {
  page: number;
  page_size: number;
  next: number | null;
  prev: number | null;
  /** Total matching rows across all pages. */
  count: number;
  /**
   * @deprecated Prefer `count`. Kept for older clients during migration.
   */
  total: number;
};

export type ApiMessage = string | string[] | Record<string, string[]>;

export type PaginatedResult<T> = {
  message: ApiMessage;
  result: T[];
  pagination: PaginationMeta;
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
  count: number,
  page: number,
  pageSize: number,
  message: ApiMessage = 'success',
): PaginatedResult<T> {
  const totalPages = pageSize > 0 ? Math.ceil(count / pageSize) : 0;
  return {
    message,
    result,
    pagination: {
      page,
      page_size: pageSize,
      next: page < totalPages ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
      count,
      total: count,
    },
  };
}

/** Wrap a full (non-sliced) list as a single-page paginated payload. */
export function asSinglePageResult<T>(result: T[]): PaginatedResult<T> {
  return paginatedResult(result, result.length, 1, Math.max(result.length, 1));
}
