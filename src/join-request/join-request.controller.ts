import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JoinRequestService } from './join-request.service.js';
import { CreateJoinRequestDto } from './dto/create-join-request.dto.js';
import { UpdateJoinRequestDto } from './dto/update-join-request.dto.js';

@Controller('join-request')
export class JoinRequestController {
  constructor(private readonly joinRequestService: JoinRequestService) {}

  @Post()
  create(@Body() createJoinRequestDto: CreateJoinRequestDto) {
    return this.joinRequestService.create(createJoinRequestDto);
  }

  @Get()
  findAll() {
    return this.joinRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.joinRequestService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJoinRequestDto: UpdateJoinRequestDto) {
    return this.joinRequestService.update(+id, updateJoinRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.joinRequestService.remove(+id);
  }
}
