export interface PaginationResult {
  limit: number;
  skip: number;
  page: number;
  totalPages?: number;
  total?: number;
}

export function parsePagination(q: {
  page?: string | string[] | undefined;
  limit?: string | string[] | undefined;
  maxLimit?: number;
}): PaginationResult {
  const page = Math.max(1, Number(Array.isArray(q.page) ? q.page[0] : q.page) || 1);
  const limitRaw = Number(Array.isArray(q.limit) ? q.limit[0] : q.limit) || 10;
  const maxLimit = q.maxLimit ?? 100;
  const limit = Math.min(Math.max(1, limitRaw), maxLimit);
  const skip = (page - 1) * limit;

  return { limit, skip, page };
}

/**
 * Helper to attach total to meta after counting
 */
export function buildPaginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    total,
    page,
    limit,
    totalPages,
  };
}
