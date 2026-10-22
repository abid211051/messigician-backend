import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { OnboardService } from './onboard.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { uploadSingle } from '../core/file-upload/upload.decorator.js';
import { ZodValidationPipe } from '../core/pipes/zod-validation.pipe.js';

import {
  createMessSchema,
  messJoinReqSchema,
  subMessListSchema,
  type CreateMessBodyDto,
  type MessJoinReqBodyDto,
  type SubMessListParamsDto,
} from './onboard.dto.js';
import type { IAuthReq } from '../auth/auth.types.js';
import { AuthService } from '../auth/auth.service.js';
import { ConfigService } from '@nestjs/config';
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from '../../utils/set-auth-cookies.util.js';

type AuthenticatedRequest = Request & {
  user: { id: string };
};

@Controller('onboard')
@UseGuards(JwtAuthGuard)
export class OnboardController {
  constructor(
    private readonly onboardService: OnboardService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('create-mess')
  @uploadSingle
  async createMess(
    @Req() req: IAuthReq,
    @Res({ passthrough: true }) res: Response,
    @Body(new ZodValidationPipe(createMessSchema.shape.body))
    body: CreateMessBodyDto,
    @UploadedFile(new ZodValidationPipe(createMessSchema.shape.file))
    file?: Express.Multer.File,
  ) {
    if (!req.user?.id) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = await this.onboardService.createMess({
      file,
      fname: body.fname,
      userId: req.user.id,
    });

    const accessToken = await this.authService.generateAccessToken(user);
    const refreshToken = await this.authService.generateRefreshToken(user);

    setAccessTokenCookie(res, accessToken, this.configService);
    setRefreshTokenCookie(res, refreshToken, this.configService);

    return user;
  }

  @Get('sub-mess-list/:mess_id')
  async getSubMessList(
    @Param(new ZodValidationPipe(subMessListSchema.shape.params))
    params: SubMessListParamsDto,
  ) {
    return await this.onboardService.getSubMessList(params.mess_id);
  }

  @Post('join-request')
  async createJoinRequest(
    @Req() req: AuthenticatedRequest,

    @Body(new ZodValidationPipe(messJoinReqSchema.shape.body))
    body: MessJoinReqBodyDto,
  ) {
    return await this.onboardService.createJoinRequest({
      userId: req.user.id,
      messId: body.mess_id,
      subMessId: body.sub_mess_id,
    });
  }
}
