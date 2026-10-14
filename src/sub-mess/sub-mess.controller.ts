import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubMessService } from './sub-mess.service.js';
import { CreateSubMessDto } from './dto/create-sub-mess.dto.js';
import { UpdateSubMessDto } from './dto/update-sub-mess.dto.js';

@Controller('sub-mess')
export class SubMessController {
  constructor(private readonly subMessService: SubMessService) {}

  @Post()
  create(@Body() createSubMessDto: CreateSubMessDto) {
    return this.subMessService.create(createSubMessDto);
  }

  @Get()
  findAll() {
    return this.subMessService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subMessService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubMessDto: UpdateSubMessDto) {
    return this.subMessService.update(+id, updateSubMessDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subMessService.remove(+id);
  }
}
