import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TasksService } from './task.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { TaskStatus } from './schemas/task.schema';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @MessagePattern({ cmd: 'create_task' })
  create(@Payload() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @MessagePattern({ cmd: 'find_all_tasks' })
  findAll() {
    return this.tasksService.findAll();
  }

  @MessagePattern({ cmd: 'find_task_by_id' })
  findById(@Payload() id: string) {
    return this.tasksService.findById(id);
  }

  @MessagePattern({ cmd: 'update_task' })
  update(@Payload() data: { id: string; updateTaskDto: UpdateTaskDto }) {
    return this.tasksService.update(data.id, data.updateTaskDto);
  }

  @MessagePattern({ cmd: 'remove_task' })
  remove(@Payload() id: string) {
    return this.tasksService.remove(id);
  }

  @MessagePattern({ cmd: 'find_tasks_by_project_id' })
  findByProjectId(@Payload() projectId: string) {
    return this.tasksService.findByProjectId(projectId);
  }

  @MessagePattern({ cmd: 'find_tasks_by_assignee_id' })
  findByAssigneeId(@Payload() assigneeId: string) {
    return this.tasksService.findByAssigneeId(assigneeId);
  }

  @MessagePattern({ cmd: 'find_tasks_by_status' })
  findByStatus(@Payload() status: TaskStatus) {
    return this.tasksService.findByStatus(status);
  }

  @MessagePattern({ cmd: 'find_tasks_by_due_date_range' })
  findByDueDateRange(@Payload() data: { startDate: Date; endDate: Date }) {
    return this.tasksService.findByDueDateRange(data.startDate, data.endDate);
  }

  @MessagePattern({ cmd: 'find_tasks_by_tags' })
  findByTags(@Payload() tags: string[]) {
    return this.tasksService.findByTags(tags);
  }

  @MessagePattern({ cmd: 'update_task_status' })
  updateTaskStatus(@Payload() data: { id: string; status: TaskStatus }) {
    return this.tasksService.updateTaskStatus(data.id, data.status);
  }

  @MessagePattern({ cmd: 'log_hours' })
  logHours(@Payload() data: { id: string; hours: number }) {
    return this.tasksService.logHours(data.id, data.hours);
  }

  @MessagePattern({ cmd: 'get_task_dependency_graph' })
  getTaskDependencyGraph() {
    return this.tasksService.getTaskDependencyGraph();
  }
}