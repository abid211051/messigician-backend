import { Module } from '@nestjs/common';
import { OnboardService } from './onboard.service.js';
import { OnboardController } from './onboard.controller.js';

@Module({
  controllers: [OnboardController],
  providers: [OnboardService],
})
export class OnboardModule {}
