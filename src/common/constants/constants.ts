export const AUTH_CONSTANTS = {
  ACCESS_TOKEN_EXPIRES_IN: '1d',
  REFRESH_TOKEN_EXPIRES_IN: '15d',

  ACCESS_TOKEN_MAX_AGE: 24 * 60 * 60 * 1000,
  REFRESH_TOKEN_MAX_AGE: 15 * 24 * 60 * 60 * 1000,

  ACCESS_TOKEN_TYPE: 'access',
  REFRESH_TOKEN_TYPE: 'refresh',

  ACCESS_TOKEN_COOKIE: 'accessToken',
  REFRESH_TOKEN_COOKIE: 'refreshToken',
} as const;

export const MESS_ROLES_KEY = 'mess_roles';
export const ROLES_KEY = 'roles';

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};
