import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service.js';
import { TenantsController } from './tenants.controller.js';
import { AuthModule } from '../../auth/auth.module.js';
import { CommonModule } from '../../common/common.module.js';

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [TenantsController],
  providers: [TenantsService],
})
export class TenantsModule {}
