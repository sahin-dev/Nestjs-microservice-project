import { IsOptional, IsString, IsDate, IsBoolean, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMilestoneDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsMongoId()
  completedBy?: string;
}