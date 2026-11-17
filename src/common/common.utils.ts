import { ForbiddenException, Injectable } from '@nestjs/common';
import { MAX_PER_PAGE_ITEMS, PER_PAGE_ITEMS } from './common.constant.js';
import { PaginationMeta } from './common.types.js';

@Injectable()
export class CommonUtils {
  constructor() {}

  getPagination(page: number, limit: number, totalItems: number) {
    const safeLimit = Math.min(
      Math.max(limit || PER_PAGE_ITEMS, 1),
      MAX_PER_PAGE_ITEMS,
    );
    const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));
    const currentPage = Math.min(page, totalPages);

    return {
      skip: (currentPage - 1) * safeLimit,
      take: safeLimit,
      meta: {
        totalItems,
        totalPages,
        currentPage,
        itemsPerPage: safeLimit,
      } satisfies PaginationMeta,
    };
  }

  requireOwnerMessId(messId: string | null | undefined): string {
    if (!messId) {
      throw new ForbiddenException('You do not belong to a mess');
    }

    return messId;
  }
}
