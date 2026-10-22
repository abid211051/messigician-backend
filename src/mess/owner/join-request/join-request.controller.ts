import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';

import { JoinRequestService } from './join-request.service.js';

import {
  getJoinRequestsSchema,
  joinRequestAcceptSchema,
  joinRequestRejectSchema,
} from './join-request.dto.js';

import type {
  GetJoinRequestsParamsDto,
  JoinRequestAcceptBodyDto,
  JoinRequestRejectParamsDto,
} from './join-request.dto.js';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard.js';
import { MessRoleGuard } from '../../../auth/guards/mess-role.guard.js';
import { MessRole } from '../../../auth/decorators/mess-role.decorator.js';

@Controller('join-request')
@UseGuards(JwtAuthGuard, MessRoleGuard)
@MessRole('owner')
export class JoinRequestController {
  constructor(private readonly joinRequestService: JoinRequestService) {}

  @Post('accept')
  async accept(
    @Body({ schema: joinRequestAcceptSchema.shape.body })
    body: JoinRequestAcceptBodyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.joinRequestService.accept({
      requestId: body.request_id,
      userId: body.user_id,
      subMessId: body.sub_mess_id,
    });

    if (result.status === 'already_in_mess') {
      res.status(200);

      return {
        message: 'User already belongs to a mess — request removed',
      };
    }

    return { message: 'User added successfully' };
  }

  @Delete('reject/:request_id')
  @HttpCode(200)
  async reject(
    @Param({ schema: joinRequestRejectSchema.shape.params })
    params: JoinRequestRejectParamsDto,
  ) {
    await this.joinRequestService.reject(params.request_id);

    return { message: 'Join request rejected' };
  }

  @Get(':mess_id')
  async getByMessId(
    @Param({ schema: getJoinRequestsSchema.shape.params })
    params: GetJoinRequestsParamsDto,
  ) {
    return this.joinRequestService.getByMessId(params.mess_id);
  }
}
