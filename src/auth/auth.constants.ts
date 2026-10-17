import type { CookieOptions } from 'express';
import type { ConfigService } from '@nestjs/config';

export const ACCESS_TOKEN_COOKIE = 'accessToken';
export const REFRESH_TOKEN_COOKIE = 'refreshToken';

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export const ACCESS_TOKEN_MAX_AGE = ACCESS_TOKEN_TTL_SECONDS * 1000;

export const REFRESH_TOKEN_MAX_AGE = REFRESH_TOKEN_TTL_SECONDS * 1000;

export function getAuthCookieOptions(
  configService: ConfigService,
): CookieOptions {
  const sameSite = configService.get<'lax' | 'strict' | 'none'>(
    'COOKIE_SAME_SITE',
    'lax',
  );

  return {
    httpOnly: true,
    secure:
      configService.get('NODE_ENV') === 'production' || sameSite === 'none',
    sameSite,
    path: '/',
  };
}
