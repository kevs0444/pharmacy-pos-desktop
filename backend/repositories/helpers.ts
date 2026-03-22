import type { PaginationQuery, PaginatedResult } from '../types/api'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

export function normalizePagination(query?: PaginationQuery): { page: number; pageSize: number; offset: number } {
  const page = Math.max(DEFAULT_PAGE, Math.trunc(query?.page ?? DEFAULT_PAGE))
  const requestedPageSize = Math.trunc(query?.pageSize ?? DEFAULT_PAGE_SIZE)
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, requestedPageSize))

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
  }
}

export function buildPaginatedResult<T>(items: T[], total: number, page: number, pageSize: number): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export function escapeLike(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
}
