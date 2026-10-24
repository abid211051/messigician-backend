import { Module } from '@nestjs/common';
import { SubMessController } from './sub-mess.controller.js';
import { SubMessService } from './sub-mess.service.js';
import { AuthModule } from '../../../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [SubMessController],
  providers: [SubMessService],
})
export class SubMessModule {}
