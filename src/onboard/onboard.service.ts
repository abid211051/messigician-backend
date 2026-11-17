import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { Prisma } from '../../generated/prisma/client.js';

import { PrismaService } from '../prisma/prisma.service.js';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service.js';
import { assertSubMessHasAvailableSeat } from '../common/sub-mess.utils.js';

@Injectable()
export class OnboardService {
  private readonly logger = new Logger(OnboardService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async createMess(input: {
    file?: Express.Multer.File;
    fname: string;
    userId: string;
  }) {
    const { file, fname, userId } = input;

    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userWithMembership = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { mess_id: true },
    });

    if (userWithMembership?.mess_id) {
      throw new ConflictException('User already in a mess');
    }

    const image = file ? await this.cloudinary.uploadImage(file) : null;

    const images: Prisma.InputJsonArray = image
      ? [
          {
            url: image.url,
            public_id: image.public_id,
          },
        ]
      : [];

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const currentUser = await tx.users.findUnique({
            where: { id: userId },
            select: { id: true },
          });

          if (!currentUser) {
            throw new NotFoundException('User not found');
          }

          const currentUserState = await tx.users.findUniqueOrThrow({
            where: { id: userId },
            select: { mess_id: true },
          });

          if (currentUserState.mess_id) {
            throw new ConflictException('User already in a mess');
          }

          const mess = await tx.mess.create({
            data: {
              name: fname,
              join_code: randomBytes(6).toString('hex'),
              images,
            },
            select: { id: true },
          });

          await tx.sub_mess.create({
            data: {
              mess_id: mess.id,
              name: 'Block-1',
            },
          });

          const updatedUser = await tx.users.findUniqueOrThrow({
            where: { id: userId },
            select: { id: true, email: true, role: true, ban: true },
          });

          await tx.users.update({
            where: { id: userId },
            data: {
              mess_id: mess.id,
              mess_role: 'owner',
              sub_mess_id: null,
              monthly_rent: null,
              total_due: null,
            },
          });

          return {
            ...updatedUser,
            mess_id: mess.id,
            mess_role: 'owner' as const,
            sub_mess_id: null,
          };
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error) {
      if (image) {
        await this.cleanupUploadedImage(image.public_id);
      }

      throw error;
    }
  }

  async getSubMessList(messId: string) {
    const rows = await this.prisma.sub_mess.findMany({
      where: { mess_id: messId },
      select: {
        id: true,
        name: true,
        mess_id: true,
        no_of_seats: true,
        _count: { select: { users: true } },
      },
    });

    if (rows.length === 0) {
      throw new NotFoundException('No mess found with that ID');
    }

    return rows.map(({ _count, ...row }) => ({
      ...row,
      no_of_members: _count.users,
      available_seats: Math.max(row.no_of_seats - _count.users, 0),
      is_full: _count.users >= row.no_of_seats,
    }));
  }

  async createJoinRequest(input: {
    userId: string;
    messId: string;
    subMessId: string;
  }) {
    const { userId, messId, subMessId } = input;

    return this.prisma.$transaction(
      async (tx) => {
        const user = await tx.users.findUnique({
          where: { id: userId },
          select: { id: true, mess_id: true },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        if (user.mess_id) {
          throw new ConflictException('You are already in a hostel mess');
        }

        await assertSubMessHasAvailableSeat(tx, messId, subMessId);

        return tx.join_requests.create({
          data: {
            user_id: userId,
            mess_id: messId,
            sub_mess_id: subMessId,
          },
          select: { created_at: true },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  private async cleanupUploadedImage(publicId: string): Promise<void> {
    try {
      await this.cloudinary.deleteImage(publicId);
    } catch (error) {
      this.logger.error(
        `Failed to clean up Cloudinary image: ${publicId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
