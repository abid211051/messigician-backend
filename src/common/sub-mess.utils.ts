import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';

export async function assertSubMessHasAvailableSeat(
  tx: Prisma.TransactionClient,
  messId: string,
  subMessId: string,
): Promise<void> {
  const subMess = await tx.sub_mess.findFirst({
    where: { id: subMessId, mess_id: messId },
    select: { no_of_seats: true },
  });

  if (!subMess) {
    throw new NotFoundException('Mess or sub-mess not found');
  }

  const memberCount = await tx.users.count({
    where: {
      mess_id: messId,
      sub_mess_id: subMessId,
      mess_role: { in: ['member', 'manager'] },
    },
  });

  if (memberCount >= subMess.no_of_seats) {
    throw new ConflictException('This sub-mess is full');
  }
}
