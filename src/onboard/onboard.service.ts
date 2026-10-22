import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';

import { PrismaService } from '../prisma/prisma.service.js';
import { CloudinaryService } from '../core/cloudinary/cloudinary.service.js';

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
      select: { mess_id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.mess_id !== null) {
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
            select: { mess_id: true },
          });

          if (!currentUser) {
            throw new NotFoundException('User not found');
          }

          if (currentUser.mess_id !== null) {
            throw new ConflictException('User already in a mess');
          }

          const mess = await tx.mess.create({
            data: {
              fname,
              images,
            },
            select: { id: true },
          });

          const subMess = await tx.sub_mess.create({
            data: {
              mess_id: mess.id,
              fname: 'Block-1',
            },
            select: { id: true },
          });

          const updatedUser = await tx.users.update({
            where: { id: userId },
            data: {
              mess_id: mess.id,
              mess_role: 'owner',
            },
            select: {
              id: true,
              email: true,
              mess_id: true,
              mess_role: true,
            },
          });

          await tx.sub_mess_managers.create({
            data: {
              user_id: userId,
              mess_id: mess.id,
              sub_mess_id: subMess.id,
              is_owner: true,
            },
          });

          return updatedUser;
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
        fname: true,
        mess_id: true,
      },
    });

    if (rows.length === 0) {
      throw new NotFoundException('No mess found with that ID');
    }

    return rows;
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
          select: { mess_id: true },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        if (user.mess_id !== null) {
          throw new ConflictException('You are already in a hostel mess');
        }

        return tx.users_join_request.create({
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
