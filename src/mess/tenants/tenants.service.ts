import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { AllSubMessMembersQueryDto, EditSubMessMemberBodyDto } from './tenants.dto.js';
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
      select: { id: true, name: true },
    });
    return rows.map(({ id, name }) => ({ id, sub_mess_name: name }));
  }

  async getAllMembers(
    ownerMessId: string | null | undefined,
    query: AllSubMessMembersQueryDto,
  ) {
    const messId = this.commonUtils.requireOwnerMessId(ownerMessId);
    const where = {
      mess_id: messId,
      OR: [{ mess_role: 'member' as const }, { mess_role: 'manager' as const }],
      ...(query.sub_mess_ids.length
        ? { sub_mess_id: { in: query.sub_mess_ids } }
        : {}),
    };
    const totalItems = await this.prisma.users.count({ where });
    const pagination = this.commonUtils.getPagination(
      query.page,
      PER_PAGE_ITEMS,
      totalItems,
    );
    const rows = await this.prisma.users.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { created_at: 'desc' },
      include: {
        profiles: {
          select: { fname: true, images: true, phone: true },
        },
        sub_mess: { select: { name: true } },
      },
    });

    return {
      data: rows.map((row) => ({
        id: row.id,
        user_id: row.id,
        mess_id: row.mess_id,
        sub_mess_id: row.sub_mess_id,
        role: row.mess_role,
        sub_mess_name: row.sub_mess?.name ?? null,
        monthly_rent:
          row.monthly_rent === null ? null : Number(row.monthly_rent),
        tenant_name: row.profiles?.fname ?? null,
        images: row.profiles?.images ?? null,
        phone: row.profiles?.phone ?? null,
        email: row.email,
      })),
      meta: pagination.meta,
    };
  }

  async deleteSingle(ownerMessId: string | null | undefined, id: string) {
    const messId = this.commonUtils.requireOwnerMessId(ownerMessId);
    const result = await this.prisma.users.updateMany({
      where: {
        id,
        mess_id: messId,
        OR: [{ mess_role: 'member' }, { mess_role: 'manager' }],
      },
      data: { mess_id: null, sub_mess_id: null, mess_role: null },
    });
    if (!result.count) throw new NotFoundException('Member not found');
    return { message: 'Member deleted successfully' };
  }

  async deleteBulk(ownerMessId: string | null | undefined, ids: string[]) {
    const messId = this.commonUtils.requireOwnerMessId(ownerMessId);
    const result = await this.prisma.users.updateMany({
      where: {
        id: { in: [...new Set(ids)] },
        mess_id: messId,
        OR: [{ mess_role: 'member' }, { mess_role: 'manager' }],
      },
      data: { mess_id: null, sub_mess_id: null, mess_role: null },
    });
    if (!result.count) throw new NotFoundException('No members found to delete');
    return { message: 'Members deleted successfully' };
  }

  async edit(
    ownerMessId: string | null | undefined,
    id: string,
    body: EditSubMessMemberBodyDto,
  ) {
    const messId = this.commonUtils.requireOwnerMessId(ownerMessId);
    if (body.sub_mess_id !== undefined) {
      const target = await this.prisma.sub_mess.findFirst({
        where: { id: body.sub_mess_id, mess_id: messId },
        select: { id: true },
      });
      if (!target) {
        throw new BadRequestException('Sub-mess does not belong to your mess');
      }
    }

    const data =
      body.sub_mess_id !== undefined
        ? { sub_mess_id: body.sub_mess_id }
        : { monthly_rent: body.monthly_rent };

    const result = await this.prisma.users.updateMany({
      where: {
        id,
        mess_id: messId,
        OR: [{ mess_role: 'member' }, { mess_role: 'manager' }],
      },
      data,
    });
    if (!result.count) throw new NotFoundException('Member not found');
    return { message: 'Members Edited successfully' };
  }
}
