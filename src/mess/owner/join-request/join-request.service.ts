import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class JoinRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async accept(input: {
    requestId: string;
    userId: string;
    subMessId: string;
  }) {
    const { requestId, userId, subMessId } = input;

    return this.prisma.$transaction(async (tx) => {
      const request = await tx.users_join_request.findUnique({
        where: { id: requestId },
        select: {
          id: true,
          user_id: true,
          mess_id: true,
        },
      });

      if (!request) {
        throw new NotFoundException('Join request not found');
      }

      if (request.user_id !== userId) {
        throw new BadRequestException(
          'The request does not belong to this user',
        );
      }

      const user = await tx.users.findUnique({
        where: { id: userId },
        select: { mess_id: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // The user already joined a mess, so remove the obsolete request.
      if (user.mess_id !== null) {
        await tx.users_join_request.delete({
          where: { id: requestId },
        });

        return { status: 'already_in_mess' as const };
      }

      const subMess = await tx.sub_mess.findUnique({
        where: { id: subMessId },
        select: { mess_id: true },
      });

      if (!subMess) {
        throw new NotFoundException('Sub-mess not found');
      }

      if (subMess.mess_id !== request.mess_id) {
        throw new BadRequestException(
          'The sub-mess does not belong to the requested mess',
        );
      }

      // The unique constraint on user_id prevents duplicate membership.
      const membership = await tx.sub_mess_members.createMany({
        data: [{ user_id: userId, sub_mess_id: subMessId }],
        skipDuplicates: true,
      });

      if (membership.count === 0) {
        throw new ConflictException('User is already assigned to a sub-mess');
      }

      await tx.users.update({
        where: { id: userId },
        data: {
          mess_id: subMess.mess_id,
          sub_mess_id: subMessId,
          mess_role: 'member',
        },
      });

      await tx.users_join_request.delete({
        where: { id: requestId },
      });

      return { status: 'accepted' as const };
    });
  }

  async reject(requestId: string): Promise<void> {
    const result = await this.prisma.users_join_request.deleteMany({
      where: { id: requestId },
    });

    if (result.count === 0) {
      throw new NotFoundException('Join request not found');
    }
  }

  async getByMessId(messId: string) {
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
      sub_mess_name: request.sub_mess.fname,
      fname: request.users.profiles?.fname ?? null,
      phone: request.users.profiles?.phone ?? null,
      images: request.users.profiles?.images ?? null,
      email: request.users.email,
    }));
  }
}
