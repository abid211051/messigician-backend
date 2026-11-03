import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JoinRequestService } from './join-request.service.js';
import {
  joinRequestAcceptSchema,
  joinRequestRejectSchema,
  type JoinRequestAcceptBodyDto,
  type JoinRequestRejectParamsDto,
} from './join-request.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { MessRoleGuard } from '../../auth/guards/mess-role.guard.js';
import { MessRole } from '../../auth/decorators/mess-role.decorator.js';
import type { IAuthReq } from '../../auth/auth.types.js';

@Controller('join-request')
@UseGuards(JwtAuthGuard, MessRoleGuard)
@MessRole('owner')
export class JoinRequestController {
  constructor(private readonly joinRequestService: JoinRequestService) {}

  @Get()
  getAll(@Req() req: IAuthReq) {
    return this.joinRequestService.getAll(req.user.mess_id);
  }

  @Post('accept')
  accept(
    @Req() req: IAuthReq,
    @Body({ schema: joinRequestAcceptSchema.shape.body })
    body: JoinRequestAcceptBodyDto,
  ) {
    return this.joinRequestService.accept({
      messId: req.user.mess_id,
      requestId: body.request_id,
      subMessId: body.sub_mess_id,
    });
  }

  @Delete('reject/:request_id')
  reject(
    @Req() req: IAuthReq,
    @Param({ schema: joinRequestRejectSchema.shape.params })
    params: JoinRequestRejectParamsDto,
  ) {
    return this.joinRequestService.reject(req.user.mess_id, params.request_id);
  }
}
