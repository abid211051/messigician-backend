import { PartialType } from '@nestjs/mapped-types';
import { CreateOnboardDto } from './create-onboard.dto.js';

export class UpdateOnboardDto extends PartialType(CreateOnboardDto) {}
