import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { SubMessService } from './sub-mess.service.js';
import {
  createSubMessSchema,
  deleteBulkSubMessSchema,
  deleteSingleSubMessSchema,
  getAllSubMessSchema,
  getSingleSubMessSchema,
} from './sub-mess.dto.js';
import type {
  CreateSubMessBodyDto,
  DeleteBulkSubMessBodyDto,
  DeleteSingleSubMessParamsDto,
  GetAllSubMessQueryDto,
  GetSingleSubMessParamsDto,
} from './sub-mess.dto.js';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard.js';
import { MessRoleGuard } from '../../../auth/guards/mess-role.guard.js';
import { MessRole } from '../../../auth/decorators/mess-role.decorator.js';
import type { IAuthReq } from '../../../auth/auth.types.js';

@Controller('sub-mess')
@UseGuards(JwtAuthGuard, MessRoleGuard)
@MessRole('owner')
export class SubMessController {
  constructor(private readonly subMessService: SubMessService) {}

  @Get('all')
  getAll(
    @Req() req: IAuthReq,
    @Query({ schema: getAllSubMessSchema.shape.query })
    query: GetAllSubMessQueryDto,
  ) {
    return this.subMessService.getAll(req.user.mess_id, query);
  }

  @Get(':id')
  getOne(
    @Req() req: IAuthReq,
    @Param({ schema: getSingleSubMessSchema.shape.params })
    params: GetSingleSubMessParamsDto,
  ) {
    return this.subMessService.getOne(req.user.mess_id, params.id);
  }

  @Post()
  create(
    @Req() req: IAuthReq,
    @Body({ schema: createSubMessSchema.shape.body })
    body: CreateSubMessBodyDto,
  ) {
    return this.subMessService.create(req.user.mess_id, body);
  }

  @Delete('single/:id')
  deleteOne(
    @Req() req: IAuthReq,
    @Param({ schema: deleteSingleSubMessSchema.shape.params })
    params: DeleteSingleSubMessParamsDto,
  ) {
    return this.subMessService.deleteOne(req.user.mess_id, params.id);
  }

  @Delete('bulk')
  deleteMany(
    @Req() req: IAuthReq,
    @Body({ schema: deleteBulkSubMessSchema.shape.body })
    body: DeleteBulkSubMessBodyDto,
  ) {
    return this.subMessService.deleteMany(req.user.mess_id, body.ids);
  }
}
