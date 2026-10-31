import { Module } from '@nestjs/common';

import { JoinRequestController } from './join-request.controller.js';
import { JoinRequestService } from './join-request.service.js';
import { CommonModule } from '../../common/common.module.js';
import { AuthModule } from '../../auth/auth.module.js';

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [JoinRequestController],
  providers: [JoinRequestService],
})
export class JoinRequestModule {}
