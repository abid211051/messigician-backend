import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type {
  CreateSubMessBodyDto,
  GetAllSubMessQueryDto,
} from './sub-mess.dto.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class SubMessService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(ownerMessId: string | null, query: GetAllSubMessQueryDto) {
    if (!ownerMessId) {
      throw new ForbiddenException('You do not belong to a mess');
    }

    const { page, limit, search, sortBy, sortOrder } = query;

    const where = {
      mess_id: ownerMessId,
      ...(search
        ? { fname: { contains: search, mode: 'insensitive' as const } }
        : {}),
    };

    const totalItems = await this.prisma.sub_mess.count({ where });

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const currentPage = Math.min(page, totalPages);

    const orderBy =
      sortBy === 'created_at'
        ? { created_at: sortOrder }
        : sortBy === 'total_rent'
          ? { sub_mess_infos: { total_rent: sortOrder } }
          : { sub_mess_members: { _count: sortOrder } };

    const rows = totalItems
      ? await this.prisma.sub_mess.findMany({
          where,
          skip: (currentPage - 1) * limit,
          take: limit,
          orderBy,
          select: {
            id: true,
            fname: true,
            created_at: true,
            sub_mess_infos: {
              select: {
                total_rent: true,
                total_utility: true,
                no_of_seats: true,
              },
            },
            _count: {
              select: { sub_mess_members: true },
            },
          },
        })
      : [];

    const data = rows.map((row) => ({
      id: row.id,
      sub_mess_name: row.fname,
      created_at: row.created_at,
      total_rent: row.sub_mess_infos?.total_rent ?? null,
      total_utility: row.sub_mess_infos?.total_utility ?? null,
      no_of_seats: row.sub_mess_infos?.no_of_seats ?? null,
      no_of_members: row._count.sub_mess_members,
    }));

    return {
      data,
      meta: {
        totalItems,
        totalPages,
        currentPage,
        itemsPerPage: limit,
        search,
        sortBy,
        sortOrder,
      },
    };
  }

  async getOne(ownerMessId: string | null, id: string) {
    if (!ownerMessId) {
      throw new ForbiddenException('You do not belong to a mess');
    }

    const row = await this.prisma.sub_mess.findFirst({
      where: {
        id,
        mess_id: ownerMessId,
      },
      select: {
        id: true,
        fname: true,
        created_at: true,
        sub_mess_infos: {
          select: {
            total_rent: true,
            total_utility: true,
            no_of_seats: true,
          },
        },
        _count: {
          select: { sub_mess_members: true },
        },
      },
    });

    if (!row) {
      throw new NotFoundException('Sub-mess not found');
    }

    return {
      id: row.id,
      sub_mess_name: row.fname,
      created_at: row.created_at,
      total_rent: row.sub_mess_infos?.total_rent ?? null,
      total_utility: row.sub_mess_infos?.total_utility ?? null,
      no_of_seats: row.sub_mess_infos?.no_of_seats ?? null,
      no_of_members: row._count.sub_mess_members,
    };
  }

  async create(ownerMessId: string | null, body: CreateSubMessBodyDto) {
    if (!ownerMessId) {
      throw new ForbiddenException('You do not belong to a mess');
    }

    await this.prisma.$transaction(async (tx) => {
      const subMess = await tx.sub_mess.create({
        data: {
          mess_id: ownerMessId,
          fname: body.fname,
        },
        select: { id: true },
      });

      await tx.sub_mess_infos.create({
        data: {
          sub_mess_id: subMess.id,
          ...(body.total_rent !== undefined && {
            total_rent: body.total_rent,
          }),
          ...(body.no_of_seats !== undefined && {
            no_of_seats: body.no_of_seats,
          }),
        },
      });
    });

    return { message: 'Sub-mess created successfully' };
  }

  async deleteOne(ownerMessId: string | null, id: string) {
    if (!ownerMessId) {
      throw new ForbiddenException('You do not belong to a mess');
    }

    const result = await this.prisma.sub_mess.deleteMany({
      where: {
        id,
        mess_id: ownerMessId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Sub-mess not found or already deleted');
    }

    return { message: 'Sub-mess deleted successfully' };
  }

  async deleteMany(ownerMessId: string | null, ids: string[]) {
    if (!ownerMessId) {
      throw new ForbiddenException('You do not belong to a mess');
    }

    return this.prisma.$transaction(async (tx) => {
      const uniqueIds = [...new Set(ids)];

      const found = await tx.sub_mess.findMany({
        where: {
          id: { in: uniqueIds },
          mess_id: ownerMessId,
        },
        select: { id: true },
      });

      if (found.length !== uniqueIds.length) {
        throw new BadRequestException(
          'One or more sub-messes were not found in your mess',
        );
      }

      await tx.sub_mess.deleteMany({
        where: {
          id: { in: uniqueIds },
          mess_id: ownerMessId,
        },
      });

      return { message: 'Sub-messes deleted successfully' };
    });
  }
}
