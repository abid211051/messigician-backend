import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import type { AuthRequest } from './types/auth.type.js';

import { AuthService } from './auth.service.js';
import { CreateAuthDto } from './dto/create-auth.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import {
  AUTH_CONSTANTS,
  cookieOptions,
} from '../common/constants/constants.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(PassportAuthGuard('google'))
  googleLogin() {}

  @Get('google/redirect')
  @UseGuards(PassportAuthGuard('google'))
  async googleRedirect(@Req() req: AuthRequest, @Res() res: Response) {
    if (!req.user) {
      throw new UnauthorizedException('Google authentication failed');
    }

    const tokens = await this.authService.issueTokens(req.user);

    res.cookie(AUTH_CONSTANTS.ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      ...cookieOptions,
      maxAge: AUTH_CONSTANTS.ACCESS_TOKEN_MAX_AGE,
    });

    res.cookie(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      ...cookieOptions,
      maxAge: AUTH_CONSTANTS.REFRESH_TOKEN_MAX_AGE,
    });

    return res.redirect(
      `${process.env.FRONTEND_URI}${this.authService.getRedirectPath(tokens.user)}`,
    );
  }

  @Post('google/mobile')
  async mobileGoogleLogin(@Body() dto: CreateAuthDto) {
    return {
      success: true,
      data: await this.authService.googleMobileLogin(dto.idToken),
    };
  }

  @Post('refresh')
  async refresh(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
    @Body('refreshToken') mobileRefreshToken?: string,
  ) {
    const isMobile = Boolean(mobileRefreshToken);
    const refreshToken =
      mobileRefreshToken ?? req.cookies?.[AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const data = await this.authService.refresh(refreshToken);

    if (isMobile) {
      return { success: true, data };
    }

    res.cookie(AUTH_CONSTANTS.ACCESS_TOKEN_COOKIE, data.accessToken, {
      ...cookieOptions,
      maxAge: AUTH_CONSTANTS.ACCESS_TOKEN_MAX_AGE,
    });

    return {
      success: true,
      data: { user: data.user },
    };
  }

  @Post('logout')
  async logout(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
    @Body('refreshToken') mobileRefreshToken?: string,
  ) {
    const refreshToken =
      mobileRefreshToken ?? req.cookies?.[AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE];

    await this.authService.logout(refreshToken);

    res.clearCookie(AUTH_CONSTANTS.ACCESS_TOKEN_COOKIE, cookieOptions);
    res.clearCookie(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE, cookieOptions);

    return { success: true, message: 'Logged out' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AuthRequest) {
    return {
      success: true,
      data: req.user,
    };
  }
}
