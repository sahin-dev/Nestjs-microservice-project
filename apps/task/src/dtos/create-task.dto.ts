import { IsNotEmpty, IsString, IsEnum, IsOptional, IsDate, IsArray, IsNumber, IsMongoId, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskPriority, TaskStatus } from '../schemas/task.schema';
import {  Schema as MongooseSchema } from 'mongoose';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsNotEmpty()
  @IsMongoId()
  projectId: MongooseSchema.Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  assigneeId?: MongooseSchema.Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  createdBy: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedHours?: number;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  dependencies?: string[];
}