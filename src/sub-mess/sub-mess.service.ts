import { Injectable } from '@nestjs/common';
import { CreateSubMessDto } from './dto/create-sub-mess.dto.js';
import { UpdateSubMessDto } from './dto/update-sub-mess.dto.js';

@Injectable()
export class SubMessService {
  create(createSubMessDto: CreateSubMessDto) {
    return 'This action adds a new subMess';
  }

  findAll() {
    return `This action returns all subMess`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subMess`;
  }

  update(id: number, updateSubMessDto: UpdateSubMessDto) {
    return `This action updates a #${id} subMess`;
  }

  remove(id: number) {
    return `This action removes a #${id} subMess`;
  }
}
