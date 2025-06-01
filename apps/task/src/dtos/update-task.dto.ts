import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;

  @IsOptional()
  @IsString()
  blockedReason?: string;

  @IsOptional()
  @IsString()
  loggedHours?: number;
}