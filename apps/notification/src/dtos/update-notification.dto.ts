import { IsOptional, IsBoolean, IsDate, IsString, IsEnum, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationPriority } from '../schemas/notification.schema';

export class UpdateNotificationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  read?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readAt?: Date;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;
}