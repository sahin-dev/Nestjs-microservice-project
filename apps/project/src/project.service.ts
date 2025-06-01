import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ProjectsRepository } from './repositories/project.repository';
import { CreateProjectDto } from './new-dtos/create-project.dto';
import { UpdateProjectDto } from './new-dtos/update-project.dto';
import { AddMemberDto } from './new-dtos/add-member.dto';
import { UpdateMilestoneDto } from './new-dtos/update-milestone.dto';
import { Project, ProjectStatus, ProjectMilestone } from './schemas/project.schema';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
    @Inject('TASK_SERVICE') private readonly taskServiceClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationServiceClient: ClientProxy,
    @Inject('SEARCH_SERVICE') private readonly searchServiceClient: ClientProxy,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    // Validate owner exists
    try {
      await firstValueFrom(
        this.userServiceClient.send({ cmd: 'find_user_by_id' }, createProjectDto.ownerId),
      );
    } catch (error) {
      throw new BadRequestException('Owner not found');
    }

    // Validate all members exist
    if (createProjectDto.members && createProjectDto.members.length > 0) {
      for (const member of createProjectDto.members) {
        try {
          await firstValueFrom(
            this.userServiceClient.send({ cmd: 'find_user_by_id' }, member.userId),
          );
        } catch (error) {
          throw new BadRequestException(`Member with ID ${member.userId} not found`);
        }
      }
    }

    // Validate date range
    if (createProjectDto.startDate && createProjectDto.endDate) {
      if (createProjectDto.startDate >= createProjectDto.endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    const project = await this.projectsRepository.create(createProjectDto);
    
    // Index project in search service
    this.searchServiceClient.emit('project_created', project);
    
    // Send notifications to members
    if (project.members && project.members.length > 0) {
      project.members.forEach(member => {
        this.notificationServiceClient.emit('project_member_added', {
          projectId: project._id,
          projectName: project.name,
          userId: member.userId,
          role: member.role,
        });
      });
    }
    
    return project;
  }

  async findAll(): Promise<Project[]> {
    return this.projectsRepository.findAll();
  }

  async findById(id: string): Promise<Project> {
    const project = await this.projectsRepository.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<Project> {
    const project = await this.findById(id);
    
    // Check if user has permission to update (owner or admin)
    if (project.ownerId.toString() !== userId) {
      const user = await firstValueFrom(
        this.userServiceClient.send({ cmd: 'find_user_by_id' }, userId),
      );
      if (user.role !== 'admin') {
        throw new ForbiddenException('You do not have permission to update this project');
      }
    }

    // Validate new members if provided
    if (updateProjectDto.members && updateProjectDto.members.length > 0) {
      for (const member of updateProjectDto.members) {
        try {
          await firstValueFrom(
            this.userServiceClient.send({ cmd: 'find_user_by_id' }, member.userId),
          );
        } catch (error) {
          throw new BadRequestException(`Member with ID ${member.userId} not found`);
        }
      }
    }

    // Validate date range
    if (updateProjectDto.startDate && updateProjectDto.endDate) {
      if (updateProjectDto.startDate >= updateProjectDto.endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    const updatedProject = await this.projectsRepository.update(id, updateProjectDto);

    if(!updatedProject) {
      throw new NotFoundException(`Project with ID ${id} not found`); 
    }
    
    // Update project in search service
    this.searchServiceClient.emit('project_updated', updatedProject);
    
    // Send notification if status changed
    if (updateProjectDto.status && updateProjectDto.status !== project.status) {
      this.notificationServiceClient.emit('project_status_changed', {
        projectId: updatedProject._id,
        projectName: updatedProject.name,
        status: updatedProject.status,
        members: updatedProject.members.map(m => m.userId),
      });
    }
    
    return updatedProject;
  }

  async remove(id: string, userId: string): Promise<Project> {
    const project = await this.findById(id);
    
    // Check if user has permission to delete (owner or admin)
    if (project.ownerId.toString() !== userId) {
      const user = await firstValueFrom(
        this.userServiceClient.send({ cmd: 'find_user_by_id' }, userId),
      );
      if (user.role !== 'admin') {
        throw new ForbiddenException('You do not have permission to delete this project');
      }
    }

    const deletedProject = await this.projectsRepository.remove(id);

    if (!deletedProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    
    // Remove project from search service
    this.searchServiceClient.emit('project_deleted', id);
    
    // Send notification to members
    this.notificationServiceClient.emit('project_deleted', {
      projectId: deletedProject._id,
      projectName: deletedProject.name,
      members: deletedProject.members.map(m => m.userId),
    });
    
    return deletedProject;
  }

  async findByOwnerId(ownerId: string): Promise<Project[]> {
    return this.projectsRepository.findByOwnerId(ownerId);
  }

  async findByMemberId(memberId: string): Promise<Project[]> {
    return this.projectsRepository.findByMemberId(memberId);
  }

  async findByStatus(status: ProjectStatus): Promise<Project[]> {
    return this.projectsRepository.findByStatus(status);
  }

  async findByTags(tags: string[]): Promise<Project[]> {
    return this.projectsRepository.findByTags(tags);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Project[]> {
    return this.projectsRepository.findByDateRange(startDate, endDate);
  }

  async addMember(projectId: string, memberData: AddMemberDto, userId: string): Promise<Project | null> {
    const project = await this.findById(projectId);
    
    // Check if user has permission to add members (owner, admin, or project manager)
    const isOwner = project.ownerId.toString() === userId;
    const isProjectManager = project.members.some(
      m => m.userId.toString() === userId && m.role.toLowerCase().includes('manager'),
    );
    
    if (!isOwner && !isProjectManager) {
      const user = await firstValueFrom(
        this.userServiceClient.send({ cmd: 'find_user_by_id' }, userId),
      );
      if (user.role !== 'admin') {
        throw new ForbiddenException('You do not have permission to add members to this project');
      }
    }

    // Validate member exists
    try {
      await firstValueFrom(
        this.userServiceClient.send({ cmd: 'find_user_by_id' }, memberData.userId),
      );
    } catch (error) {
      throw new BadRequestException('User not found');
    }

    // Check if user is already a member
    const isAlreadyMember = project.members.some(
      m => m.userId.toString() === memberData.userId && m.isActive,
    );
    if (isAlreadyMember) {
      throw new BadRequestException('User is already a member of this project');
    }

    const updatedProject = await this.projectsRepository.addMember(projectId, memberData);
    
    // Send notification to new member
    if (updatedProject) {
      this.notificationServiceClient.emit('project_member_added', {
        projectId: updatedProject._id,
        projectName: updatedProject.name,
        userId: memberData.userId,
        role: memberData.role,
      });
      return updatedProject;
    }
    
    // Optionally, you could throw an error or just return null as before
    return null;
  }

  async removeMember(projectId: string, memberUserId: string, userId: string): Promise<Project> {
    const project = await this.findById(projectId);
    
    // Check if user has permission to remove members (owner, admin, or the member themselves)
    const isOwner = project.ownerId.toString() === userId;
    const isSelf = memberUserId === userId;
    
    if (!isOwner && !isSelf) {
      const user = await firstValueFrom(
        this.userServiceClient.send({ cmd: 'find_user_by_id' }, userId),
      );
      if (user.role !== 'admin') {
        throw new ForbiddenException('You do not have permission to remove this member');
      }
    }
    

    // Cannot remove the owner
    if (project.ownerId.toString() === memberUserId) {
      throw new BadRequestException('Cannot remove the project owner');
    }

    const updatedProject = await this.projectsRepository.removeMember(projectId, memberUserId);

    if (!updatedProject) {
      throw new NotFoundException(`Member with ID ${memberUserId} not found in project ${projectId}`);
    }
    
    // Send notification to removed member
    this.notificationServiceClient.emit('project_member_removed', {
      projectId: updatedProject._id,
      projectName: updatedProject.name,
      userId: memberUserId,
    });
    
    return updatedProject;
  }

  async updateMemberRole(projectId: string, memberUserId: string, role: string, userId: string): Promise<Project> {
    const project = await this.findById(projectId);
    
    // Check if user has permission to update member roles (owner or admin)
    if (project.ownerId.toString() !== userId) {
      const user = await firstValueFrom(
        this.userServiceClient.send({ cmd: 'find_user_by_id' }, userId),
      );
      if (user.role !== 'admin') {
        throw new ForbiddenException('You do not have permission to update member roles');
      }
    }

    const updatedProject = await this.projectsRepository.updateMemberRole(projectId, memberUserId, role);
    if (!updatedProject) {
      throw new NotFoundException(`Member with ID ${memberUserId} not found in project ${projectId}`);
    }
    
    // Send notification to member
    this.notificationServiceClient.emit('project_member_role_updated', {
      projectId: updatedProject._id,
      projectName: updatedProject.name,
      userId: memberUserId,
      newRole: role,
    });
    
    return updatedProject;
  }

  async addMilestone(projectId: string, milestone: ProjectMilestone, userId: string): Promise<Project> {
    const project = await this.findById(projectId);
    
    // Check if user has permission to add milestones
    const hasPermission = this.checkProjectPermission(project, userId);
    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to add milestones to this project');
    }

    const updatedProject = await this.projectsRepository.addMilestone(projectId, milestone);

    if (!updatedProject) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    } 
    
    // Send notification to project members
    this.notificationServiceClient.emit('project_milestone_added', {
      projectId: updatedProject._id,
      projectName: updatedProject.name,
      milestoneTitle: milestone.title,
      members: updatedProject.members.map(m => m.userId),
    });
    
    return updatedProject;
  }

  async updateMilestone(
    projectId: string,
    milestoneIndex: number,
    updateData: UpdateMilestoneDto,
    userId: string,
  ): Promise<Project> {
    const project = await this.findById(projectId);
    
    // Check if user has permission to update milestones
    const hasPermission = this.checkProjectPermission(project, userId);
    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to update milestones in this project');
    }

    if (milestoneIndex >= project.milestones.length) {
      throw new BadRequestException('Milestone index out of range');
    }

    if (updateData.isCompleted && !updateData.completedBy) {
      updateData.completedBy = userId;
    }

    const updatedProject = await this.projectsRepository.updateMilestone(projectId, milestoneIndex, updateData);
    if (!updatedProject) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }
    
    // Send notification if milestone completed
    if (updateData.isCompleted) {
      this.notificationServiceClient.emit('project_milestone_completed', {
        projectId: updatedProject._id,
        projectName: updatedProject.name,
        milestoneTitle: updatedProject.milestones[milestoneIndex].title,
        completedBy: userId,
        members: updatedProject.members.map(m => m.userId),
      });
    }
    
    return updatedProject;
  }

  async removeMilestone(projectId: string, milestoneIndex: number, userId: string): Promise<Project | null> {
    const project = await this.findById(projectId);
    
    // Check if user has permission to remove milestones
    const hasPermission = this.checkProjectPermission(project, userId);
    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to remove milestones from this project');
    }

    if (milestoneIndex >= project.milestones.length) {
      throw new BadRequestException('Milestone index out of range');
    }

    return this.projectsRepository.removeMilestone(projectId, milestoneIndex);
  }

  async updateProgress(projectId: string, progress: number, userId: string): Promise<Project> {
    const project = await this.findById(projectId);
    
    // Check if user has permission to update progress
    const hasPermission = this.checkProjectPermission(project, userId);
    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to update project progress');
    }

    const updatedProject = await this.projectsRepository.updateProgress(projectId, progress);

    if(!updatedProject) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }
    
    // Send notification if project completed
    if (progress === 100 && project.progress < 100) {
      this.notificationServiceClient.emit('project_completed', {
        projectId: updatedProject._id,
        projectName: updatedProject.name,
        members: updatedProject.members.map(m => m.userId),
      });
    }
    
    return updatedProject;
  }

  async updateBudget(projectId: string, spentAmount: number, userId: string): Promise<Project | null> {
    const project = await this.findById(projectId);
    
    // Check if user has permission to update budget
    const hasPermission = this.checkProjectPermission(project, userId);
    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to update project budget');
    }

    return this.projectsRepository.updateBudget(projectId, spentAmount);
  }

  async getProjectStats(projectId: string): Promise<any> {
    const project = await this.findById(projectId);
    const stats = await this.projectsRepository.getProjectStats(projectId);
    
    // Get task statistics from task service
    try {
      const tasks = await firstValueFrom(
        this.taskServiceClient.send({ cmd: 'find_tasks_by_project_id' }, projectId),
      );
      
      const taskStats = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'done').length,
        inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
        todoTasks: tasks.filter(t => t.status === 'todo').length,
        overdueTasks: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
      };
      
      return { ...stats, ...taskStats };
    } catch (error) {
      return stats;
    }
  }

  async searchProjects(query: string): Promise<Project[]> {
    return this.projectsRepository.searchProjects(query);
  }

  async getProjectsByPriority(): Promise<{ [key: string]: Project[] }> {
    return this.projectsRepository.getProjectsByPriority();
  }

  async getOverdueProjects(): Promise<Project[]> {
    return this.projectsRepository.getOverdueProjects();
  }

  async getUserProjects(userId: string): Promise<{ owned: Project[]; member: Project[] }> {
    const [ownedProjects, memberProjects] = await Promise.all([
      this.projectsRepository.findByOwnerId(userId),
      this.projectsRepository.findByMemberId(userId),
    ]);

    return {
      owned: ownedProjects,
      member: memberProjects.filter(p => p.ownerId.toString() !== userId),
    };
  }

  private checkProjectPermission(project: Project, userId: string): boolean {
    // Owner has all permissions
    if (project.ownerId.toString() === userId) {
      return true;
    }

    // Check if user is a member with appropriate role
    const member = project.members.find(m => m.userId.toString() === userId && m.isActive);
    if (member && (member.role.toLowerCase().includes('manager') || member.role.toLowerCase().includes('lead'))) {
      return true;
    }

    return false;
  }
}