import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OnboardService } from './onboard.service.js';
import { CreateOnboardDto } from './dto/create-onboard.dto.js';
import { UpdateOnboardDto } from './dto/update-onboard.dto.js';

@Controller('onboard')
export class OnboardController {
  constructor(private readonly onboardService: OnboardService) {}

  @Post()
  create(@Body() createOnboardDto: CreateOnboardDto) {
    return this.onboardService.create(createOnboardDto);
  }

  @Get()
  findAll() {
    return this.onboardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.onboardService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOnboardDto: UpdateOnboardDto) {
    return this.onboardService.update(+id, updateOnboardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.onboardService.remove(+id);
  }
}
