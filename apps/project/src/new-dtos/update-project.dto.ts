import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';
import { IsBoolean, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  spentBudget?: number;
}