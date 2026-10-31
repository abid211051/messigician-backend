import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  allSubMessMembersSchema,
  deleteSingleSubMessMemberSchema,
  deleteBulkSubMessMembersSchema,
  editSubMessMemberSchema,
  type AllSubMessMembersQueryDto,
  type DeleteSingleSubMessMemberParamsDto,
  type DeleteBulkSubMessMembersBodyDto,
  type EditSubMessMemberParamsDto,
  type EditSubMessMemberBodyDto,
} from './tenants.dto.js';

import { TenantsService } from './tenants.service.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { MessRoleGuard } from '../../auth/guards/mess-role.guard.js';
import { MessRole } from '../../auth/decorators/mess-role.decorator.js';
import type { IAuthReq } from '../../auth/auth.types.js';

@Controller('tenants')
@UseGuards(JwtAuthGuard, MessRoleGuard)
@MessRole('owner')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('sub-mess/all')
  getAllSubMess(@Req() req: IAuthReq) {
    return this.tenantsService.getAllSubMess(req.user.mess_id);
  }

  @Get()
  getAllMembers(
    @Req() req: IAuthReq,
    @Query({ schema: allSubMessMembersSchema.shape.query })
    query: AllSubMessMembersQueryDto,
  ) {
    return this.tenantsService.getAllMembers(req.user.mess_id, query);
  }

  @Delete('single/:id')
  deleteSingle(
    @Req() req: IAuthReq,
    @Param({ schema: deleteSingleSubMessMemberSchema.shape.params })
    params: DeleteSingleSubMessMemberParamsDto,
  ) {
    return this.tenantsService.deleteSingle(req.user.mess_id, params.id);
  }

  @Delete('bulk')
  deleteBulk(
    @Req() req: IAuthReq,
    @Body({ schema: deleteBulkSubMessMembersSchema.shape.body })
    body: DeleteBulkSubMessMembersBodyDto,
  ) {
    return this.tenantsService.deleteBulk(req.user.mess_id, body.ids);
  }

  @Put('edit/:id')
  edit(
    @Req() req: IAuthReq,
    @Param({ schema: editSubMessMemberSchema.shape.params })
    params: EditSubMessMemberParamsDto,
    @Body({ schema: editSubMessMemberSchema.shape.body })
    body: EditSubMessMemberBodyDto,
  ) {
    return this.tenantsService.edit(req.user.mess_id, params.id, body);
  }
}
