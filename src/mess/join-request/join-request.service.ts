import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

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

    const requests = await this.prisma.users_join_request.findMany({
      where: { mess_id: messId },
      select: {
        id: true,
        user_id: true,
        mess_id: true,
        sub_mess_id: true,
        created_at: true,
        sub_mess: {
          select: { fname: true },
        },
        users: {
          select: {
            email: true,
            profiles: {
              select: {
                fname: true,
                phone: true,
                images: true,
              },
            },
          },
        },
      },
    });

    return requests.map((request) => ({
      id: request.id,
      user_id: request.user_id,
      mess_id: request.mess_id,
      sub_mess_id: request.sub_mess_id,
      created_at: request.created_at,
      sub_mess_name: request.sub_mess?.fname ?? null,
      fname: request.users.profiles?.fname ?? null,
      phone: request.users.profiles?.phone ?? null,
      images: request.users.profiles?.images ?? null,
      email: request.users.email,
    }));
  }

  async accept(input: {
    messId: string | null | undefined;
    requestId: string;
    subMessId: string;
  }) {
    const messId = this.commonUtils.requireOwnerMessId(input.messId);
    const { requestId, subMessId } = input;

    return this.prisma.$transaction(async (tx) => {
      const request = await tx.users_join_request.findFirst({
        where: {
          id: requestId,
          mess_id: messId,
        },
        select: {
          id: true,
          user_id: true,
        },
      });

      if (!request) {
        throw new NotFoundException('Join request not found');
      }

      const user = await tx.users.findUnique({
        where: { id: request.user_id },
        select: { mess_id: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.mess_id !== null) {
        await tx.users_join_request.deleteMany({
          where: {
            id: request.id,
            mess_id: messId,
          },
        });

        return {
          message: 'User already belongs to a mess — request removed',
        };
      }

      const subMess = await tx.sub_mess.findFirst({
        where: {
          id: subMessId,
          mess_id: messId,
        },
        select: { id: true },
      });

      if (!subMess) {
        throw new BadRequestException(
          'The sub-mess does not belong to this mess',
        );
      }

      await tx.sub_mess_members.create({
        data: {
          user_id: request.user_id,
          sub_mess_id: subMess.id,
        },
      });

      await tx.users.update({
        where: { id: request.user_id },
        data: {
          mess_id: messId,
          sub_mess_id: subMess.id,
          mess_role: 'member',
        },
      });

      await tx.users_join_request.deleteMany({
        where: {
          id: request.id,
          mess_id: messId,
        },
      });

      return { message: 'User added successfully' };
    });
  }

  async reject(ownerMessId: string | null | undefined, requestId: string) {
    const messId = this.commonUtils.requireOwnerMessId(ownerMessId);

    const result = await this.prisma.users_join_request.deleteMany({
      where: {
        id: requestId,
        mess_id: messId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Join request not found');
    }

    return { message: 'Join request rejected' };
  }
}
