import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProjectsService } from './project.service';
import { CreateProjectDto } from './new-dtos/create-project.dto';
import { UpdateProjectDto } from './new-dtos/update-project.dto';
import { AddMemberDto } from './new-dtos/add-member.dto';
import { UpdateMilestoneDto } from './new-dtos/update-milestone.dto';
import { ProjectStatus, ProjectMilestone } from './schemas/project.schema';

@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @MessagePattern({ cmd: 'create_project' })
  create(@Payload() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @MessagePattern({ cmd: 'find_all_projects' })
  findAll() {
    return this.projectsService.findAll();
  }

  @MessagePattern({ cmd: 'find_project_by_id' })
  findById(@Payload() id: string) {
    return this.projectsService.findById(id);
  }

  @MessagePattern({ cmd: 'update_project' })
  update(@Payload() data: { id: string; updateProjectDto: UpdateProjectDto; userId: string }) {
    return this.projectsService.update(data.id, data.updateProjectDto, data.userId);
  }

  @MessagePattern({ cmd: 'remove_project' })
  remove(@Payload() data: { id: string; userId: string }) {
    return this.projectsService.remove(data.id, data.userId);
  }

  @MessagePattern({ cmd: 'find_projects_by_owner_id' })
  findByOwnerId(@Payload() ownerId: string) {
    return this.projectsService.findByOwnerId(ownerId);
  }

  @MessagePattern({ cmd: 'find_projects_by_member_id' })
  findByMemberId(@Payload() memberId: string) {
    return this.projectsService.findByMemberId(memberId);
  }

  @MessagePattern({ cmd: 'find_projects_by_status' })
  findByStatus(@Payload() status: ProjectStatus) {
    return this.projectsService.findByStatus(status);
  }

  @MessagePattern({ cmd: 'find_projects_by_tags' })
  findByTags(@Payload() tags: string[]) {
    return this.projectsService.findByTags(tags);
  }

  @MessagePattern({ cmd: 'find_projects_by_date_range' })
  findByDateRange(@Payload() data: { startDate: Date; endDate: Date }) {
    return this.projectsService.findByDateRange(data.startDate, data.endDate);
  }

  @MessagePattern({ cmd: 'add_project_member' })
  addMember(@Payload() data: { projectId: string; memberData: AddMemberDto; userId: string }) {
    return this.projectsService.addMember(data.projectId, data.memberData, data.userId);
  }

  @MessagePattern({ cmd: 'remove_project_member' })
  removeMember(@Payload() data: { projectId: string; memberUserId: string; userId: string }) {
    return this.projectsService.removeMember(data.projectId, data.memberUserId, data.userId);
  }

  @MessagePattern({ cmd: 'update_member_role' })
  updateMemberRole(@Payload() data: { projectId: string; memberUserId: string; role: string; userId: string }) {
    return this.projectsService.updateMemberRole(data.projectId, data.memberUserId, data.role, data.userId);
  }

  @MessagePattern({ cmd: 'add_project_milestone' })
  addMilestone(@Payload() data: { projectId: string; milestone: ProjectMilestone; userId: string }) {
    return this.projectsService.addMilestone(data.projectId, data.milestone, data.userId);
  }

  @MessagePattern({ cmd: 'update_project_milestone' })
  updateMilestone(@Payload() data: { 
    projectId: string; 
    milestoneIndex: number; 
    updateData: UpdateMilestoneDto; 
    userId: string 
  }) {
    return this.projectsService.updateMilestone(
      data.projectId, 
      data.milestoneIndex, 
      data.updateData, 
      data.userId
    );
  }

  @MessagePattern({ cmd: 'remove_project_milestone' })
  removeMilestone(@Payload() data: { projectId: string; milestoneIndex: number; userId: string }) {
    return this.projectsService.removeMilestone(data.projectId, data.milestoneIndex, data.userId);
  }

  @MessagePattern({ cmd: 'update_project_progress' })
  updateProgress(@Payload() data: { projectId: string; progress: number; userId: string }) {
    return this.projectsService.updateProgress(data.projectId, data.progress, data.userId);
  }

  @MessagePattern({ cmd: 'update_project_budget' })
  updateBudget(@Payload() data: { projectId: string; spentAmount: number; userId: string }) {
    return this.projectsService.updateBudget(data.projectId, data.spentAmount, data.userId);
  }

  @MessagePattern({ cmd: 'get_project_stats' })
  getProjectStats(@Payload() projectId: string) {
    return this.projectsService.getProjectStats(projectId);
  }

  @MessagePattern({ cmd: 'search_projects' })
  searchProjects(@Payload() query: string) {
    return this.projectsService.searchProjects(query);
  }

  @MessagePattern({ cmd: 'get_projects_by_priority' })
  getProjectsByPriority() {
    return this.projectsService.getProjectsByPriority();
  }

  @MessagePattern({ cmd: 'get_overdue_projects' })
  getOverdueProjects() {
    return this.projectsService.getOverdueProjects();
  }

  @MessagePattern({ cmd: 'get_user_projects' })
  getUserProjects(@Payload() userId: string) {
    return this.projectsService.getUserProjects(userId);
  }
}