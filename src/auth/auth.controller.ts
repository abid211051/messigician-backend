import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthGuard } from './guards/google.guard.js';
import { AuthService } from './auth.service.js';
import type { IAuthReq } from './auth.types.js';
import {
  ACCESS_TOKEN_COOKIE,
  getAuthCookieOptions,
  REFRESH_TOKEN_COOKIE,
} from './auth.constants.js';
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from '../../utils/set-auth-cookies.util.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: IAuthReq, @Res() res: Response) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('Google authentication failed');
    }

    const accessToken = await this.authService.generateAccessToken(user);
    const refreshToken = await this.authService.generateRefreshToken(user);

    setAccessTokenCookie(res, accessToken, this.configService);
    setRefreshTokenCookie(res, refreshToken, this.configService);

    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URI');

    return res.redirect(
      `${frontendUrl}${this.authService.getRedirectUrl({
        mess_role: user.mess_role ?? null,
      })}`,
    );
  }

  @Post('refresh')
  async refresh(
    @Req() req: IAuthReq,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const { accessToken } =
      await this.authService.refreshAccessToken(refreshToken);

    setAccessTokenCookie(res, accessToken, this.configService);

    return { message: 'Access token refreshed' };
  }

  @Post('logout')
  async logout(
    @Req() req: IAuthReq,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

    const cookieOptions = getAuthCookieOptions(this.configService);

    res.clearCookie(ACCESS_TOKEN_COOKIE, cookieOptions);
    res.clearCookie(REFRESH_TOKEN_COOKIE, cookieOptions);

    return { message: 'Logged out successfully' };
  }
}
