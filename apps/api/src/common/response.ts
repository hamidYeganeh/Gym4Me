import type { FastifyRequest } from "fastify";
export function success<T>(request: FastifyRequest, data: T) {
  return { data, meta: { request_id: request.id, timestamp: new Date().toISOString() } };
}

export function paginated<T>(
  request: FastifyRequest,
  data: T[],
  pagination: { page: number; limit: number; total: number } & Record<string, unknown>,
) {
  return {
    data,
    meta: {
      request_id: request.id,
      timestamp: new Date().toISOString(),
      pagination: { ...pagination, pages: Math.ceil(pagination.total / pagination.limit) },
    },
  };
}
