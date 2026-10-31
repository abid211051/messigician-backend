import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CloudinaryService } from './cloudinary/cloudinary.service.js';
import { CommonUtils } from './common.utils.js';

@Module({
  imports: [ConfigModule],
  providers: [CloudinaryService, CommonUtils],
  exports: [CloudinaryService, CommonUtils],
})
export class CommonModule {}
