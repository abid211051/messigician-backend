import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { CoreModule } from './core/core.module.js';
import { OnboardModule } from './onboard/onboard.module.js';
import { JoinRequestModule } from './mess/owner/join-request/join-request.module.js';
import { SubMessModule } from './mess/owner/sub-mess/sub-mess.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    OnboardModule,
    CoreModule,
    PrismaModule,
    JoinRequestModule,
    SubMessModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
