import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';

import { OnboardModule } from './onboard/onboard.module.js';
import { JoinRequestModule } from './mess/join-request/join-request.module.js';
import { SubMessModule } from './mess/sub-mess/sub-mess.module.js';
import { TenantsModule } from './mess/tenants/tenants.module.js';
import { CommonModule } from './common/common.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    OnboardModule,
    CommonModule,
    PrismaModule,
    JoinRequestModule,
    SubMessModule,
    TenantsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
