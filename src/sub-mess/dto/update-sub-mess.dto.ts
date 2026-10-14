import { PartialType } from '@nestjs/mapped-types';
import { CreateSubMessDto } from './create-sub-mess.dto.js';

export class UpdateSubMessDto extends PartialType(CreateSubMessDto) {}
