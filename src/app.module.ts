import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule } from '@nestjs/config';
import { OnboardModule } from './onboard/onboard.module.js';
import { JoinRequestModule } from './join-request/join-request.module.js';
import { SubMessModule } from './sub-mess/sub-mess.module.js';
import { TenantModule } from './tenant/tenant.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { Controller, Get } from '@nestjs/common';

@Controller()
class AppController {
  @Get()
  health() {
    return 'Hello World!';
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    OnboardModule,
    JoinRequestModule,
    SubMessModule,
    TenantModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
