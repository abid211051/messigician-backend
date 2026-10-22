import { Module } from '@nestjs/common';

import { CoreModule } from '../core/core.module.js';
import { OnboardController } from './onboard.controller.js';
import { OnboardService } from './onboard.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [CoreModule, AuthModule],
  controllers: [OnboardController],
  providers: [OnboardService],
})
export class OnboardModule {}
