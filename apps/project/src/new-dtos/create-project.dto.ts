import { IsNotEmpty, IsString, IsEnum, IsOptional, IsDate, IsArray, IsNumber, IsMongoId, Min, Max, IsBoolean, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus, ProjectPriority } from '../schemas/project.schema';

export class CreateProjectMemberDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsString()
  role: string;
}

export class CreateProjectMilestoneDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  dueDate: Date;
}

export class ProjectSettingsDto {
  @IsOptional()
  @IsBoolean()
  allowPublicAccess?: boolean;

  @IsOptional()
  @IsBoolean()
  requireApprovalForTasks?: boolean;

  @IsOptional()
  @IsBoolean()
  enableTimeTracking?: boolean;

  @IsOptional()
  @IsBoolean()
  enableBudgetTracking?: boolean;
}

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority;

  @IsNotEmpty()
  @IsMongoId()
  ownerId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProjectMemberDto)
  members?: CreateProjectMemberDto[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProjectMilestoneDto)
  milestones?: CreateProjectMilestoneDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsUrl()
  repositoryUrl?: string;

  @IsOptional()
  @IsUrl()
  documentationUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectSettingsDto)
  settings?: ProjectSettingsDto;
}