import { IsOptional, IsEnum, IsBoolean, IsDate, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType, NotificationPriority } from '../schemas/notification.schema';

export class NotificationFilterDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsBoolean()
  read?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}