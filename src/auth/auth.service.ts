import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import type {
  IGoogleUserInfo,
  IGoogleUserPayload,
  IUser,
} from './auth.types.js';
import { createHash } from 'crypto';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
} from './auth.constants.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  async loginGoogleUser({
    fname,
    email,
    avatar_url,
  }: IGoogleUserInfo): Promise<IGoogleUserPayload> {
    if (!email) throw new UnauthorizedException('Email is required for login');
    const images = avatar_url ? [{ url: avatar_url, public_id: null }] : [];

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.users.upsert({
        where: { email },
        create: { email },
        update: {},
      });

      await tx.profiles.upsert({
        where: { user_id: user.id },
        create: {
          user_id: user.id,
          fname,
          images,
        },
        update: {},
      });

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        mess_id: user.mess_id,
        mess_role: user.mess_role,
        ban: user.ban,
        sub_mess_id: user.sub_mess_id,
      };
    });
  }

  getRedirectUrl({ mess_role }: { mess_role: string }) {
    if (!mess_role) return '/onboard';
    if (mess_role === 'owner') return '/users/owner';
    if (mess_role === 'manager') return '/users/manager';
    return '/users/member';
  }

  async verifyAccessToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<IUser>(token);
      if (!payload || typeof payload !== 'object' || !payload.sub) {
        throw new UnauthorizedException('Invalid token');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
  }> {
    try {
      const payload = await this.jwtService.verifyAsync<IUser>(refreshToken);
      if (!payload || typeof payload !== 'object' || !payload.sub) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const storedToken = await this.prisma.refresh_tokens.findFirst({
        where: {
          user_id: payload.sub,
          token_hash: this.hashToken(refreshToken),
        },
        include: {
          users: true,
        },
      });

      if (
        !storedToken ||
        storedToken.revoked_at ||
        storedToken.expires_at < new Date() ||
        storedToken.user_id !== payload.sub ||
        storedToken.users.ban
      ) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = await this.jwtService.signAsync(
        {
          sub: storedToken.user_id,
          email: storedToken.users.email,
          role: storedToken.users.role,
          mess_id: storedToken.users.mess_id,
          mess_role: storedToken.users.mess_role,
          sub_mess_id: storedToken.users.sub_mess_id,
        },
        { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    await this.prisma.refresh_tokens.updateMany({
      where: {
        token_hash: this.hashToken(refreshToken),
        revoked_at: null,
      },
      data: {
        revoked_at: new Date(),
      },
    });
  }

  async issueTokens(user: IGoogleUserPayload) {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        mess_id: user.mess_id,
        mess_role: user.mess_role,
        sub_mess_id: user.sub_mess_id,
      },
      { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        mess_id: user.mess_id,
        mess_role: user.mess_role,
        sub_mess_id: user.sub_mess_id,
      },
      { expiresIn: REFRESH_TOKEN_TTL_SECONDS },
    );

    await this.prisma.refresh_tokens.create({
      data: {
        user_id: user.id,
        token_hash: this.hashToken(refreshToken),
        expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      },
    });

    return { accessToken, refreshToken };
  }
}
