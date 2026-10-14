import { Module } from '@nestjs/common';
import { JoinRequestService } from './join-request.service.js';
import { JoinRequestController } from './join-request.controller.js';

@Module({
  controllers: [JoinRequestController],
  providers: [JoinRequestService],
})
export class JoinRequestModule {}
