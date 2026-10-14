import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { createHash, randomUUID } from 'crypto';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AUTH_CONSTANTS } from '../common/constants/constants.js';

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async findOrCreateUser({
    email,
    fname,
    avatarUrl,
  }: {
    email: string;
    fname: string;
    avatarUrl?: string;
  }) {
    const normalizedEmail = email.trim().toLowerCase();

    let user = await this.prisma.users.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      user = await this.prisma.users.create({
        data: { email: normalizedEmail },
      });
    }

    if (user.ban) {
      throw new UnauthorizedException('Account has been banned');
    }

    await this.prisma.profiles.upsert({
      where: { user_id: user.id },
      create: {
        user_id: user.id,
        fname,
        images: (avatarUrl
          ? [{ url: avatarUrl, public_id: null }]
          : []) as Prisma.InputJsonValue,
      },
      update: {
        fname,
        ...(avatarUrl
          ? {
              images: [
                { url: avatarUrl, public_id: null },
              ] as Prisma.InputJsonValue,
            }
          : {}),
      },
    });

    return user;
  }

  async googleMobileLogin(idToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.config.getOrThrow<string>('GOOGLE_MOBILE_CLIENT_ID'),
    });

    const profile = ticket.getPayload();

    if (!profile?.email || profile.email_verified !== true) {
      throw new UnauthorizedException('Invalid Google ID token');
    }

    const user = await this.findOrCreateUser({
      email: profile.email,
      fname: profile.name ?? profile.email,
      avatarUrl: profile.picture,
    });

    return this.issueTokens(user);
  }

  async issueTokens(user: {
    id: string;
    email: string;
    role: string;
    ban?: boolean | null;
    mess_role: string | null;
    mess_id: string | null;
    sub_mess_id: string | null;
  }) {
    if (!user || user.ban) {
      throw new UnauthorizedException('Account unavailable');
    }

    const accessToken = await this.jwt.signAsync(
      {
        sub: user.id,
        tokenType: AUTH_CONSTANTS.ACCESS_TOKEN_TYPE,
      },
      {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRES_IN,
        algorithm: 'HS256',
      },
    );

    const refreshToken = await this.jwt.signAsync(
      {
        sub: user.id,
        tokenType: AUTH_CONSTANTS.REFRESH_TOKEN_TYPE,
        jti: randomUUID(),
      },
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_IN,
        algorithm: 'HS256',
      },
    );

    await this.prisma.refresh_tokens.create({
      data: {
        user_id: user.id,
        token_hash: this.hashToken(refreshToken),
        expires_at: new Date(Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_MAX_AGE),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: this.publicUser(user),
    };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; tokenType: string };

    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        algorithms: ['HS256'],
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (
      payload.tokenType !== AUTH_CONSTANTS.REFRESH_TOKEN_TYPE ||
      !payload.sub
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.prisma.refresh_tokens.findUnique({
      where: { token_hash: this.hashToken(refreshToken) },
      include: { users: true },
    });

    if (
      !session ||
      session.user_id !== payload.sub ||
      session.revoked_at ||
      session.expires_at <= new Date() ||
      session.users.ban
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // No refresh-token rotation: only issue a new access token.
    return this.issueAccessToken(session.users);
  }

  private async issueAccessToken(user: {
    id: string;
    email: string;
    role: string;
    ban?: boolean | null;
    mess_role: string | null;
    mess_id: string | null;
    sub_mess_id: string | null;
  }) {
    const accessToken = await this.jwt.signAsync(
      {
        sub: user.id,
        tokenType: AUTH_CONSTANTS.ACCESS_TOKEN_TYPE,
      },
      {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRES_IN,
        algorithm: 'HS256',
      },
    );

    return {
      accessToken,
      user: this.publicUser(user),
    };
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) return;

    await this.prisma.refresh_tokens.updateMany({
      where: {
        token_hash: this.hashToken(refreshToken),
        revoked_at: null,
      },
      data: { revoked_at: new Date() },
    });
  }

  private publicUser(user: {
    id: string;
    email: string;
    role: string;
    mess_role: string | null;
    mess_id: string | null;
    sub_mess_id: string | null;
  }) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      mess_role: user.mess_role,
      mess_id: user.mess_id,
      sub_mess_id: user.sub_mess_id,
    };
  }

  getRedirectPath(user: { mess_role: string | null }) {
    if (!user.mess_role) return '/onboard';
    if (user.mess_role === 'owner') return '/users/owner';
    if (user.mess_role === 'manager') return '/users/manager';
    return '/users/member';
  }
}
