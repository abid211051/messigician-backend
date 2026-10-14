import { PartialType } from '@nestjs/mapped-types';
import { CreateJoinRequestDto } from './create-join-request.dto.js';

export class UpdateJoinRequestDto extends PartialType(CreateJoinRequestDto) {}
