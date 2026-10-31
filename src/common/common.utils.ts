import { ForbiddenException, Injectable } from '@nestjs/common';
import { PaginationMeta } from './common.types.js';

@Injectable()
export class CommonUtils {
  constructor() {}

  getPagination(page: number, limit: number, totalItems: number) {
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const currentPage = Math.min(page, totalPages);

    return {
      skip: (currentPage - 1) * limit,
      take: limit,
      meta: {
        totalItems,
        totalPages,
        currentPage,
        itemsPerPage: limit,
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
