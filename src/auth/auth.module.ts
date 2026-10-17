import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { GoogleStrategy } from './google.strategy.js';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleAuthGuard } from './guards/google.guard.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { MessRoleGuard } from './guards/mess-role.guard.js';

@Module({
  imports: [
    PassportModule.register({
      session: false,
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    GoogleAuthGuard,
    JwtAuthGuard,
    MessRoleGuard,
  ],
  exports: [AuthService, JwtAuthGuard, MessRoleGuard],
})
export class AuthModule {}
