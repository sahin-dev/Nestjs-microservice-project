import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_COMPLETED = 'task_completed',
  TASK_DUE_SOON = 'task_due_soon',
  TASK_OVERDUE = 'task_overdue',
  PROJECT_CREATED = 'project_created',
  PROJECT_UPDATED = 'project_updated',
  PROJECT_MILESTONE_COMPLETED = 'project_milestone_completed',
  PROJECT_MEMBER_ADDED = 'project_member_added',
  PROJECT_MEMBER_REMOVED = 'project_member_removed',
  COMMENT_ADDED = 'comment_added',
  MENTION = 'mention',
  SYSTEM = 'system',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  message: string;

  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ type: String, enum: NotificationPriority, default: NotificationPriority.MEDIUM })
  priority: NotificationPriority;

  @Prop({ type: MongooseSchema.Types.Mixed })
  data: Record<string, any>;

  @Prop({ default: false })
  read: boolean;

  @Prop()
  readAt: Date;

  @Prop({ default: true })
  active: boolean;

  @Prop()
  expiresAt: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes for faster queries
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });