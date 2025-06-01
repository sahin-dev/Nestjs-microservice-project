import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Schema({ timestamps: true })
export class ProjectMember {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  role: string; // Project Manager, Developer, Designer, etc.

  @Prop({ default: Date.now })
  joinedAt: Date;

  @Prop({ default: true })
  isActive: boolean;
}

@Schema({ timestamps: true })
export class ProjectMilestone {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop()
  completedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  completedBy: MongooseSchema.Types.ObjectId;
}

@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: String, enum: ProjectStatus, default: ProjectStatus.PLANNING })
  status: ProjectStatus;

  @Prop({ type: String, enum: ProjectPriority, default: ProjectPriority.MEDIUM })
  priority: ProjectPriority;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  ownerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: [ProjectMember], default: [] })
  members: ProjectMember[];

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop({ default: 0 })
  budget: number;

  @Prop({ default: 0 })
  spentBudget: number;

  @Prop({ default: [] })
  tags: string[];

  @Prop({ type: [ProjectMilestone], default: [] })
  milestones: ProjectMilestone[];

  @Prop({ default: 0 })
  progress: number; // Percentage (0-100)

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  repositoryUrl: string;

  @Prop()
  documentationUrl: string;

  @Prop({ type: Object })
  settings: {
    allowPublicAccess: boolean;
    requireApprovalForTasks: boolean;
    enableTimeTracking: boolean;
    enableBudgetTracking: boolean;
  };
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Create indexes for better query performance
ProjectSchema.index({ ownerId: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ priority: 1 });
ProjectSchema.index({ 'members.userId': 1 });
ProjectSchema.index({ tags: 1 });
ProjectSchema.index({ startDate: 1, endDate: 1 });