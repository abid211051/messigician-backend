import type { Response } from 'express';
import type { ConfigService } from '@nestjs/config';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  getAuthCookieOptions,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
} from '.././src/auth/auth.constants.js';

export function setAccessTokenCookie(
  res: Response,
  token: string,
  configService: ConfigService,
): void {
  res.cookie(ACCESS_TOKEN_COOKIE, token, {
    ...getAuthCookieOptions(configService),
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
}

export function setRefreshTokenCookie(
  res: Response,
  token: string,
  configService: ConfigService,
): void {
  res.cookie(REFRESH_TOKEN_COOKIE, token, {
    ...getAuthCookieOptions(configService),
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}
