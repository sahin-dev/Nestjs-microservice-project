import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { TasksRepository } from './repositories/task.repository';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { Task, TaskStatus } from './schemas/task.schema';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationServiceClient: ClientProxy,
    @Inject('SEARCH_SERVICE') private readonly searchServiceClient: ClientProxy,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    // Validate assignee exists if provided
    if (createTaskDto.assigneeId) {
      try {
        await firstValueFrom(
          this.userServiceClient.send({ cmd: 'find_user_by_id' }, createTaskDto.assigneeId),
        );
      } catch (error) {
        throw new BadRequestException('Assignee not found');
      }
    }

    // Check for circular dependencies
    if (createTaskDto.dependencies && createTaskDto.dependencies.length > 0) {
      await this.checkCircularDependencies(null, createTaskDto.dependencies);
    }

    const task = await this.tasksRepository.create(createTaskDto);
    
    // Index task in search service
    this.searchServiceClient.emit('task_created', task);
    
    // Send notification if task is assigned
    if (task.assigneeId) {
      this.notificationServiceClient.emit('task_assigned', {
        taskId: task._id,
        assigneeId: task.assigneeId,
        title: task.title,
      });
    }
    
    return task;
  }

  async findAll(): Promise<Task[]> {
    return this.tasksRepository.findAll();
  }

  async findById(id: string): Promise<Task> {
    
    const task = await this.tasksRepository.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: string, updateTaskDto: any): Promise<Task> {
    
    await this.findById(id);
    
    // Validate assignee exists if provided
    if (updateTaskDto.assigneeId) {
      try {
        await firstValueFrom(
          this.userServiceClient.send({ cmd: 'find_user_by_id' }, updateTaskDto.assigneeId),
        );
      } catch (error) {
        throw new BadRequestException('Assignee not found');
      }
    }

    // Check for circular dependencies
    if (updateTaskDto.dependencies && updateTaskDto.dependencies.length > 0) {
      await this.checkCircularDependencies(id, updateTaskDto.dependencies);
    }

    const updatedTask = await this.tasksRepository.update(id, updateTaskDto);

    if (!updatedTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    
    // Update task in search service
    this.searchServiceClient.emit('task_updated', updatedTask);
    
    // Send notification if status changed
    if (updateTaskDto.status) {
      this.notificationServiceClient.emit('task_status_changed', {
        taskId: updatedTask._id,
        assigneeId: updatedTask.assigneeId,
        title: updatedTask.title,
        status: updatedTask.status,
      });
    }
    
    // Send notification if assignee changed
    if (updateTaskDto.assigneeId) {
      this.notificationServiceClient.emit('task_assigned', {
        taskId: updatedTask._id,
        assigneeId: updatedTask.assigneeId,
        title: updatedTask.title,
      });
    }
    
    return updatedTask;
  }

  async remove(id: string): Promise<Task> {
    const task = await this.tasksRepository.remove(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    
    // Remove task from search service
    this.searchServiceClient.emit('task_deleted', id);
    
    return task;
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    return this.tasksRepository.findByProjectId(projectId);
  }

  async findByAssigneeId(assigneeId: string): Promise<Task[]> {
    return this.tasksRepository.findByAssigneeId(assigneeId);
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {

    return this.tasksRepository.findByStatus(status);
  }

  async findByDueDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    return this.tasksRepository.findByDueDateRange(startDate, endDate);
  }

  async findByTags(tags: string[]): Promise<Task[]> {
    return this.tasksRepository.findByTags(tags);
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task | null> {
    const task = await this.findById(id);
    
    // Check if task is blocked
    if (task.isBlocked && status === TaskStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot start a blocked task');
    }
    
    // Check if all dependencies are completed
    if (task.dependencies && task.dependencies.length > 0 && status === TaskStatus.IN_PROGRESS) {
      const dependencies = await Promise.all(
        task.dependencies.map(depId => this.findById(depId.toString())),
      );
      
      const incompleteDependencies = dependencies.filter(dep => dep.status !== TaskStatus.DONE);
      if (incompleteDependencies.length > 0) {
        throw new BadRequestException('Cannot start task with incomplete dependencies');
      }
    }
    
    const updatedTask = await this.tasksRepository.updateTaskStatus(id, status);

    if (!updatedTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    
    // Update task in search service
    this.searchServiceClient.emit('task_updated', updatedTask);
    
    // Send notification
    this.notificationServiceClient.emit('task_status_changed', {
      taskId: updatedTask._id,
      assigneeId: updatedTask.assigneeId,
      title: updatedTask.title,
      status: updatedTask.status,
    });
    
    return updatedTask;
  }

  async logHours(id: string, hours: number): Promise<Task | null> {
    if (hours <= 0) {
      throw new BadRequestException('Hours must be greater than 0');
    }
    
    const task = await this.findById(id);
    const updatedTask = await this.tasksRepository.logHours(id, hours);
    
    return updatedTask;
  }

  private async checkCircularDependencies(taskId: string | null, dependencies: string[]): Promise<void> {
    // Build dependency graph
    const tasks = await this.tasksRepository.findAll();
    const graph = new Map<string, string[]>();
    
    (tasks as Task[]).forEach((task: Task) => {
      graph.set((task._id as string).toString(), task.dependencies.map(dep => dep.toString()));
    });
    
    // Add the new dependencies to the graph
    if (taskId) {
      graph.set(taskId, dependencies);
    }
    
    // Check for cycles using DFS
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (node: string): boolean => {


      if (!visited.has(node)) {
        visited.add(node);
        recursionStack.add(node);
        
        const neighbors = graph.get(node) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor) && hasCycle(neighbor)) {
            return true;
          } else if (recursionStack.has(neighbor)) {
            return true;
          }
        }
      }
      
      recursionStack.delete(node);
      return false;
    };
    
    for (const taskId of graph.keys()) {
      if (hasCycle(taskId)) {
        throw new BadRequestException('Circular dependency detected');
      }
    }
  }

  async getTasksWithDependencies(): Promise<Task[]> {
    return this.tasksRepository.findTasksWithDependencies();
  }

  async getTaskDependencyGraph(): Promise<any> {
    const tasks = await this.tasksRepository.findAll();

   
    
    // Build dependency graph
    const graph = {};
    tasks.forEach(task => {
      graph[String(task._id)] = {
        id: String(task._id),
        title: task.title,
        status: task.status,
        dependencies: task.dependencies.map(dep => dep.toString()),
      };
    });
    
    return graph;
  }
}