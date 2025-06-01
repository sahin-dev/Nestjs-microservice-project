import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class AddMemberDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsString()
  role: string;
}