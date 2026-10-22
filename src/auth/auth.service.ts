import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  IGoogleUserInfo,
  IGoogleUserPayload,
  IUser,
} from './auth.types.js';
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

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private createTokenPayload(user: IGoogleUserPayload) {
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      mess_id: user.mess_id,
      mess_role: user.mess_role,
      sub_mess_id: user.sub_mess_id,
    };
  }

  async loginGoogleUser({
    fname,
    email,
    avatar_url,
  }: IGoogleUserInfo): Promise<IGoogleUserPayload> {
    if (!email) {
      throw new UnauthorizedException('Email is required for login');
    }

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

  getRedirectUrl({ mess_role }: { mess_role: string | null }) {
    if (!mess_role) return '/onboard';
    if (mess_role === 'owner') return '/users/owner';
    if (mess_role === 'manager') return '/users/manager';
    return '/users/member';
  }

  async generateAccessToken(user: IGoogleUserPayload): Promise<string> {
    return this.jwtService.signAsync(this.createTokenPayload(user), {
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    });
  }

  async generateRefreshToken(user: IGoogleUserPayload): Promise<string> {
    const refreshToken = await this.jwtService.signAsync(
      this.createTokenPayload(user),
      { expiresIn: REFRESH_TOKEN_TTL_SECONDS },
    );

    await this.prisma.refresh_tokens.create({
      data: {
        user_id: user.id,
        token_hash: this.hashToken(refreshToken),
        expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      },
    });

    return refreshToken;
  }

  async verifyAccessToken(token: string): Promise<IGoogleUserPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<IUser>(token);

      if (!payload?.sub) {
        throw new UnauthorizedException('Invalid token');
      }

      const user = await this.prisma.users.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          role: true,
          mess_id: true,
          mess_role: true,
          ban: true,
          sub_mess_id: true,
        },
      });

      if (!user || user.ban) {
        throw new UnauthorizedException('Invalid or unauthorized user');
      }

      return user;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    user: IGoogleUserPayload;
  }> {
    try {
      const payload = await this.jwtService.verifyAsync<IUser>(refreshToken);

      if (!payload?.sub) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const storedToken = await this.prisma.refresh_tokens.findFirst({
        where: {
          user_id: payload.sub,
          token_hash: this.hashToken(refreshToken),
        },
        include: { users: true },
      });

      if (
        !storedToken ||
        storedToken.revoked_at ||
        storedToken.expires_at <= new Date() ||
        storedToken.user_id !== payload.sub ||
        storedToken.users.ban
      ) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user: IGoogleUserPayload = {
        id: storedToken.users.id,
        email: storedToken.users.email,
        role: storedToken.users.role,
        mess_id: storedToken.users.mess_id,
        mess_role: storedToken.users.mess_role,
        ban: storedToken.users.ban,
        sub_mess_id: storedToken.users.sub_mess_id,
      };

      const accessToken = await this.generateAccessToken(user);

      return { accessToken, user };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const res = await this.prisma.refresh_tokens.updateMany({
      where: {
        token_hash: this.hashToken(refreshToken),
        revoked_at: null,
      },
      data: { revoked_at: new Date() },
    });
    console.log(res);
  }
}
