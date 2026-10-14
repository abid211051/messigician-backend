import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthDto {
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}
