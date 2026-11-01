import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CommonUtils } from '../../common/common.utils.js';

@Injectable()
export class JoinRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonUtils: CommonUtils,
  ) {}

  async getAll(ownerMessId: string | null | undefined) {
    const messId = this.commonUtils.requireOwnerMessId(ownerMessId);
    const requests = await this.prisma.join_requests.findMany({
      where: { mess_id: messId, status: 'pending' },
      select: {
        id: true,
        user_id: true,
        mess_id: true,
        sub_mess_id: true,
        created_at: true,
        sub_mess: { select: { name: true } },
        users: { select: { email: true, profiles: { select: { fname: true, phone: true, images: true } } } },
      },
    });
    return requests.map((request) => ({
      ...request,
      sub_mess_name: request.sub_mess.name,
      fname: request.users.profiles?.fname ?? null,
      phone: request.users.profiles?.phone ?? null,
      images: request.users.profiles?.images ?? null,
      email: request.users.email,
      sub_mess: undefined,
      users: undefined,
    }));
  }

  async accept(input: {
    messId: string | null | undefined;
    requestId: string;
    subMessId: string;
    decidedBy: string;
  }) {
    const messId = this.commonUtils.requireOwnerMessId(input.messId);
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.join_requests.findFirst({
        where: { id: input.requestId, mess_id: messId, status: 'pending', sub_mess_id: input.subMessId },
        select: { id: true, user_id: true, sub_mess_id: true },
      });
      if (!request) throw new NotFoundException('Join request not found');

      const current = await tx.memberships.findFirst({
        where: { user_id: request.user_id, status: 'active' },
        select: { id: true },
      });
      if (current) {
        await tx.join_requests.update({ where: { id: request.id }, data: { status: 'cancelled' } });
        return { message: 'User already belongs to a mess — request cancelled' };
      }

      const subMess = await tx.sub_mess.findFirst({
        where: { id: request.sub_mess_id, mess_id: messId },
        select: { id: true },
      });
      if (!subMess) throw new BadRequestException('The sub-mess does not belong to this mess');

      await tx.memberships.create({
        data: { user_id: request.user_id, mess_id: messId, sub_mess_id: subMess.id, role: 'member' },
      });
      await tx.join_requests.update({
        where: { id: request.id },
        data: {
          status: 'approved',
          decided_by: input.decidedBy,
          decided_at: new Date(),
        },
      });
      return { message: 'User added successfully' };
    });
  }

  async reject(ownerMessId: string | null | undefined, requestId: string) {
    const messId = this.commonUtils.requireOwnerMessId(ownerMessId);
    const result = await this.prisma.join_requests.updateMany({
      where: { id: requestId, mess_id: messId, status: 'pending' },
      data: { status: 'rejected', decided_at: new Date() },
    });
    if (!result.count) throw new NotFoundException('Join request not found');
    return { message: 'Join request rejected' };
  }
}
