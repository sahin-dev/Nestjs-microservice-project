import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
}

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: String, enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Prop({ type: String, enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project', required: true })
  projectId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  assigneeId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop()
  dueDate: Date;

  @Prop({ default: [] })
  tags: string[];

  @Prop({ default: 0 })
  estimatedHours: number;

  @Prop({ default: 0 })
  loggedHours: number;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Task' }], default: [] })
  dependencies: MongooseSchema.Types.ObjectId[];

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop()
  blockedReason: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

// Create indexes for better query performance
TaskSchema.index({ projectId: 1 });
TaskSchema.index({ assigneeId: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ tags: 1 });