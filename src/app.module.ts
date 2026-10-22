import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { CoreModule } from './core/core.module.js';
import { OnboardModule } from './onboard/onboard.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    OnboardModule,
    CoreModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
