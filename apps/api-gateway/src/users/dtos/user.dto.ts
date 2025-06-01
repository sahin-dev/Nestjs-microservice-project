import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsEnum, IsString, MinLength, IsArray } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  DEVELOPER = 'developer',
  VIEWER = 'viewer',
}

export class CreateUserDto {
  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address of the user' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password (minimum 8 characters)' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.DEVELOPER, description: 'Role of the user', required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ example: ['JavaScript', 'React', 'Node.js'], description: 'Skills of the user', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}