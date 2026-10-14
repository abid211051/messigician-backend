import { Module } from '@nestjs/common';
import { SubMessService } from './sub-mess.service.js';
import { SubMessController } from './sub-mess.controller.js';

@Module({
  controllers: [SubMessController],
  providers: [SubMessService],
})
export class SubMessModule {}
