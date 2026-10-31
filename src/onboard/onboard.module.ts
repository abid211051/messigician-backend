import { Module } from '@nestjs/common';

import { CommonModule } from '../common/common.module.js';
import { OnboardController } from './onboard.controller.js';
import { OnboardService } from './onboard.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [OnboardController],
  providers: [OnboardService],
})
export class OnboardModule {}
