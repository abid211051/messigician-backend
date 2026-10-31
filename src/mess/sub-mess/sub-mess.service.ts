import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type {
  CreateSubMessBodyDto,
  GetAllSubMessQueryDto,
} from './sub-mess.dto.js';

import { PrismaService } from '../../prisma/prisma.service.js';
import { CommonUtils } from '../../common/common.utils.js';

@Injectable()
export class SubMessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonUtils: CommonUtils,
  ) {}

  async getAll(
    ownerMessId: string | null | undefined,
    query: GetAllSubMessQueryDto,
  ) {
    const messId = this.commonUtils.requireOwnerMessId(ownerMessId);
    const { page, limit, search, sortBy, sortOrder } = query;

    const where = {
      mess_id: messId,
      ...(search
        ? { fname: { contains: search, mode: 'insensitive' as const } }
        : {}),
    };

    const totalItems = await this.prisma.sub_mess.count({ where });
    const pagination = this.commonUtils.getPagination(page, limit, totalItems);

    const orderBy =
      sortBy === 'created_at'
        ? { created_at: sortOrder }
        : sortBy === 'total_rent'
          ? { sub_mess_infos: { total_rent: sortOrder } }
          : { sub_mess_members: { _count: sortOrder } };

    const rows = totalItems
      ? await this.prisma.sub_mess.findMany({
          where,
          skip: pagination.skip,
          take: pagination.take,
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
        ...pagination.meta,
        search,
        sortBy,
        sortOrder,
      },
    };
  }

  async getOne(ownerMessId: string | null | undefined, id: string) {
    const messId = this.commonUtils.requireOwnerMessId(ownerMessId);

    const row = await this.prisma.sub_mess.findFirst({
      where: {
        id,
        mess_id: messId,
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

  async create(
    ownerMessId: string | null | undefined,
    body: CreateSubMessBodyDto,
  ) {
    const messId = this.commonUtils.requireOwnerMessId(ownerMessId);

    await this.prisma.$transaction(async (tx) => {
      const subMess = await tx.sub_mess.create({
        data: {
          mess_id: messId,
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

  async deleteOne(ownerMessId: string | null | undefined, id: string) {
    const messId = this.commonUtils.requireOwnerMessId(ownerMessId);

    const result = await this.prisma.sub_mess.deleteMany({
      where: {
        id,
        mess_id: messId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Sub-mess not found or already deleted');
    }

    return { message: 'Sub-mess deleted successfully' };
  }

  async deleteMany(ownerMessId: string | null | undefined, ids: string[]) {
    const messId = this.commonUtils.requireOwnerMessId(ownerMessId);
    const uniqueIds = [...new Set(ids)];

    return this.prisma.$transaction(async (tx) => {
      const found = await tx.sub_mess.findMany({
        where: {
          id: { in: uniqueIds },
          mess_id: messId,
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
          mess_id: messId,
        },
      });

      return { message: 'Sub-messes deleted successfully' };
    });
  }
}
