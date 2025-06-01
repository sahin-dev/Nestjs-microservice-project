import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskStatus } from '../schemas/task.schema';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';

@Injectable()
export class TasksRepository {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const newTask = new this.taskModel({
      ...createTaskDto,
      projectId: new Types.ObjectId(String(createTaskDto.projectId)),
      createdBy: new Types.ObjectId(createTaskDto.createdBy),
      assigneeId: createTaskDto.assigneeId ? new Types.ObjectId(String(createTaskDto.assigneeId)) : null,
      dependencies: createTaskDto.dependencies?.map(id => new Types.ObjectId(id)) || [],
    });
    return newTask.save();
  }

  async findAll(): Promise<Task[]> {
    return this.taskModel.find().exec();
  }

  async findById(id: string): Promise<Task | null> {
    return this.taskModel.findById(id).exec();
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task | null> {
    const updateData = { ...updateTaskDto };
    
    // Convert string IDs to ObjectIds
    if (updateData.projectId) {
      (updateData as any).projectId = new Types.ObjectId(String(updateData.projectId));
    }

    if (updateData.assigneeId) {
      (updateData as any).assigneeId = new Types.ObjectId(String(updateData.assigneeId));
    }
    if (updateData.dependencies) {
      (updateData as any).dependencies = updateData.dependencies.map(id => new Types.ObjectId(id));
    }
    
    return this.taskModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async remove(id: string): Promise<Task | null> {
    return this.taskModel.findByIdAndDelete(id).exec();
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    return this.taskModel.find({ projectId: new Types.ObjectId(projectId) }).exec();
  }

  async findByAssigneeId(assigneeId: string): Promise<Task[]> {
    return this.taskModel.find({ assigneeId: new Types.ObjectId(assigneeId) }).exec();
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    return this.taskModel.find({ status }).exec();
  }

  async findByDueDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    return this.taskModel.find({
      dueDate: { $gte: startDate, $lte: endDate },
    }).exec();
  }

  async findByTags(tags: string[]): Promise<Task[]> {
    return this.taskModel.find({ tags: { $in: tags } }).exec();
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task | null> {
    return this.taskModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).exec();
  }

  async logHours(id: string, hours: number): Promise<Task | null> {
    return this.taskModel.findByIdAndUpdate(
      id,
      { $inc: { loggedHours: hours } },
      { new: true },
    ).exec();
  }

  async findTasksWithDependencies(): Promise<Task[]> {
    return this.taskModel.find({ dependencies: { $exists: true, $ne: [] } }).exec();
  }
}