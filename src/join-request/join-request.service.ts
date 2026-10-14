import { Injectable } from '@nestjs/common';
import { CreateJoinRequestDto } from './dto/create-join-request.dto.js';
import { UpdateJoinRequestDto } from './dto/update-join-request.dto.js';

@Injectable()
export class JoinRequestService {
  create(createJoinRequestDto: CreateJoinRequestDto) {
    return 'This action adds a new joinRequest';
  }

  findAll() {
    return `This action returns all joinRequest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} joinRequest`;
  }

  update(id: number, updateJoinRequestDto: UpdateJoinRequestDto) {
    return `This action updates a #${id} joinRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} joinRequest`;
  }
}
