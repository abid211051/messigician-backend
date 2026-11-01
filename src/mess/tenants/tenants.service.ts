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

  async getAllMembers(ownerMessId: string | null | undefined, query: AllSubMessMembersQueryDto) {
    const messId = this.commonUtils.requireOwnerMessId(ownerMessId);
    const where = {
      mess_id: messId,
      status: 'active' as const,
      ...(query.sub_mess_ids.length ? { sub_mess_id: { in: query.sub_mess_ids } } : {}),
    };
    const totalItems = await this.prisma.memberships.count({ where });
    const pagination = this.commonUtils.getPagination(query.page, PER_PAGE_ITEMS, totalItems);
    const rows = totalItems
      ? await this.prisma.memberships.findMany({
          where,
          skip: pagination.skip,
          take: pagination.take,
          orderBy: { joined_at: 'desc' },
          include: {
            sub_mess: { select: { name: true } },
            users: { include: { profiles: { select: { fname: true, images: true, phone: true } } } },
          },
        })
      : [];
    return {
      data: rows.map((row) => ({
        id: row.id,
        user_id: row.user_id,
        sub_mess_id: row.sub_mess_id,
        role: row.role,
        monthly_rent: row.monthly_rent === null ? null : Number(row.monthly_rent),
        sub_mess_name: row.sub_mess?.name ?? null,
        tenant_name: row.users.profiles?.fname ?? null,
        images: row.users.profiles?.images ?? null,
        phone: row.users.profiles?.phone ?? null,
        email: row.users.email,
      })),
      meta: pagination.meta,
    };
  }

  async deleteSingle(ownerMessId: string | null | undefined, id: string) {
    const messId = this.commonUtils.requireOwnerMessId(ownerMessId);
    const member = await this.prisma.memberships.findFirst({
      where: { id, mess_id: messId, role: { not: 'owner' }, status: 'active' },
      select: { id: true },
    });
    if (!member) throw new NotFoundException('Member not found');
    await this.prisma.memberships.update({ where: { id }, data: { status: 'removed', left_at: new Date() } });
    return { message: 'Member deleted successfully' };
  }

  async deleteBulk(ownerMessId: string | null | undefined, ids: string[]) {
    const messId = this.commonUtils.requireOwnerMessId(ownerMessId);
    const result = await this.prisma.memberships.updateMany({
      where: { id: { in: [...new Set(ids)] }, mess_id: messId, role: { not: 'owner' }, status: 'active' },
      data: { status: 'removed', left_at: new Date() },
    });
    if (!result.count) throw new NotFoundException('No members found to delete');
    return { message: 'Members deleted successfully' };
  }

  async edit(ownerMessId: string | null | undefined, id: string, body: EditSubMessMemberBodyDto) {
    const messId = this.commonUtils.requireOwnerMessId(ownerMessId);
    if (body.sub_mess_id !== undefined) {
      const target = await this.prisma.sub_mess.findFirst({ where: { id: body.sub_mess_id, mess_id: messId }, select: { id: true } });
      if (!target) throw new BadRequestException('Sub-mess does not belong to your mess');
    }
    const result = await this.prisma.memberships.updateMany({
      where: { id, mess_id: messId, role: { not: 'owner' }, status: 'active' },
      data: {
        ...(body.sub_mess_id !== undefined ? { sub_mess_id: body.sub_mess_id } : {}),
        ...(body.monthly_rent !== undefined ? { monthly_rent: body.monthly_rent } : {}),
      },
    });
    if (!result.count) throw new NotFoundException('Member not found');
    return { message: 'Members Edited successfully' };
  }
}
