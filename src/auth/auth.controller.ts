import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google.guard.js';
import { AuthService } from './auth.service.js';
import { ConfigService } from '@nestjs/config';
import type { IAuthReq } from './auth.types.js';
import type { Response } from 'express';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  getAuthCookieOptions,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
} from './auth.constants.js';

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
    const { accessToken, refreshToken } = await this.authService.issueTokens(
      req.user!,
    );
    const cookieOptions = getAuthCookieOptions(this.configService);
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URI');

    return res.redirect(
      `${frontendUrl}${this.authService.getRedirectUrl({ mess_role: req.user?.mess_role! })}`,
    );
  }

  @Post('refresh')
  async refresh(@Req() req: IAuthReq, @Res() res: Response) {
    const refreshToken = req?.cookies?.[REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      throw new UnauthorizedException('Refreh token missing');
    }

    const { accessToken } =
      await this.authService.refreshAccessToken(refreshToken);

    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...getAuthCookieOptions(this.configService),
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    return res.status(200).json({
      success: true,
    });
  }

  @Post('logout')
  async logout(@Req() req: IAuthReq, @Res() res: Response) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

    const cookieOptions = getAuthCookieOptions(this.configService);

    res.clearCookie(ACCESS_TOKEN_COOKIE, cookieOptions);
    res.clearCookie(REFRESH_TOKEN_COOKIE, cookieOptions);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}
