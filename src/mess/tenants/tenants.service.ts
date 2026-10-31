import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type {
  AllSubMessMembersQueryDto,
  EditSubMessMemberBodyDto,
} from './tenants.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CommonUtils } from '../../common/common.utils.js';
import { PER_PAGE_ITEMS } from '../../common/common.constant.js';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonUtils: CommonUtils,
  ) {}

  async getAllSubMess(ownerMessId: string | null | undefined) {
    const messId = this.commonUtils.requireOwnerMessId(ownerMessId);

    const rows = await this.prisma.sub_mess.findMany({
      where: { mess_id: messId },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        fname: true,
      },
    });

    return rows.map(({ id, fname }) => ({
      id,
      sub_mess_name: fname,
    }));
  }

  async getAllMembers(
    ownerMessId: string | null | undefined,
    query: AllSubMessMembersQueryDto,
  ) {
    const messId = this.commonUtils.requireOwnerMessId(ownerMessId);
    const { page, sub_mess_ids: subMessIds } = query;

    const where = {
      sub_mess: {
        is: { mess_id: messId },
      },
      ...(subMessIds.length > 0 ? { sub_mess_id: { in: subMessIds } } : {}),
    };

    const totalItems = await this.prisma.sub_mess_members.count({ where });
    const pagination = this.commonUtils.getPagination(
      page,
      PER_PAGE_ITEMS,
      totalItems,
    );

    const rows = totalItems
      ? await this.prisma.sub_mess_members.findMany({
          where,
          skip: pagination.skip,
          take: pagination.take,
          orderBy: { created_at: 'desc' },
          include: {
            sub_mess: {
              select: { fname: true },
            },
            users: {
              include: {
                profiles: {
                  select: {
                    fname: true,
                    images: true,
                    phone: true,
                  },
                },
              },
            },
          },
        })
      : [];

    const data = rows.map((row) => {
      const {
        sub_mess,
        users,
        monthly_rent,
        total_due,
        total_paid,
        ...membership
      } = row;

      const profile = users.profiles;

      return {
        ...membership,
        monthly_rent: monthly_rent === null ? null : Number(monthly_rent),
        total_due: total_due === null ? null : Number(total_due),
        total_paid: total_paid === null ? null : Number(total_paid),
        sub_mess_name: sub_mess.fname,
        tenant_name: profile?.fname ?? null,
        images: profile?.images ?? null,
        phone: profile?.phone ?? null,
        email: users.email,
      };
    });

    return {
      data,
      meta: pagination.meta,
    };
  }

  async deleteSingle(ownerMessId: string | null | undefined, id: string) {
    const messId = this.commonUtils.requireOwnerMessId(ownerMessId);

    return this.prisma.$transaction(async (tx) => {
      const member = await tx.sub_mess_members.findFirst({
        where: {
          id,
          sub_mess: { is: { mess_id: messId } },
        },
        select: {
          id: true,
          user_id: true,
        },
      });

      if (!member) {
        throw new NotFoundException('Member not found');
      }

      const deleted = await tx.sub_mess_members.deleteMany({
        where: {
          id: member.id,
          sub_mess: { is: { mess_id: messId } },
        },
      });

      if (deleted.count === 0) {
        throw new NotFoundException('Member not found');
      }

      await tx.users.updateMany({
        where: {
          id: member.user_id,
          mess_id: messId,
        },
        data: {
          mess_id: null,
          mess_role: null,
        },
      });

      return { message: 'Member deleted successfully' };
    });
  }

  async deleteBulk(ownerMessId: string | null | undefined, ids: string[]) {
    const messId = this.commonUtils.requireOwnerMessId(ownerMessId);
    const uniqueIds = [...new Set(ids)];

    return this.prisma.$transaction(async (tx) => {
      const members = await tx.sub_mess_members.findMany({
        where: {
          id: { in: uniqueIds },
          sub_mess: { is: { mess_id: messId } },
        },
        select: {
          id: true,
          user_id: true,
        },
      });

      if (members.length === 0) {
        throw new NotFoundException('No members found to delete');
      }

      const memberIds = members.map(({ id }) => id);
      const userIds = [...new Set(members.map(({ user_id }) => user_id))];

      await tx.sub_mess_members.deleteMany({
        where: {
          id: { in: memberIds },
          sub_mess: { is: { mess_id: messId } },
        },
      });

      await tx.users.updateMany({
        where: {
          id: { in: userIds },
          mess_id: messId,
        },
        data: {
          mess_id: null,
          mess_role: null,
        },
      });

      return { message: 'Members deleted successfully' };
    });
  }

  async edit(
    ownerMessId: string | null | undefined,
    id: string,
    body: EditSubMessMemberBodyDto,
  ) {
    const messId = this.commonUtils.requireOwnerMessId(ownerMessId);

    return this.prisma.$transaction(async (tx) => {
      const member = await tx.sub_mess_members.findFirst({
        where: {
          id,
          sub_mess: { is: { mess_id: messId } },
        },
        select: { id: true },
      });

      if (!member) {
        throw new NotFoundException('Member not found');
      }

      if (body.sub_mess_id !== undefined) {
        const targetSubMess = await tx.sub_mess.findFirst({
          where: {
            id: body.sub_mess_id,
            mess_id: messId,
          },
          select: { id: true },
        });

        if (!targetSubMess) {
          throw new BadRequestException(
            'Sub-mess does not belong to your mess',
          );
        }
      }

      await tx.sub_mess_members.update({
        where: { id: member.id },
        data: {
          ...(body.sub_mess_id !== undefined && {
            sub_mess_id: body.sub_mess_id,
          }),
          ...(body.monthly_rent !== undefined && {
            monthly_rent: body.monthly_rent,
          }),
          ...(body.total_due !== undefined && {
            total_due: body.total_due,
          }),
        },
      });

      return { message: 'Members Edited successfully' };
    });
  }
}
