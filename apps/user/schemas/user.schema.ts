import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  DEVELOPER = 'developer',
  VIEWER = 'viewer',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.DEVELOPER })
  role: UserRole;

  @Prop({ default: [] })
  skills: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLogin: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);