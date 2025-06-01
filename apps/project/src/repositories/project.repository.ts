import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectStatus, ProjectMember, ProjectMilestone } from '../schemas/project.schema';
import { CreateProjectDto } from '../new-dtos/create-project.dto';
import { UpdateProjectDto } from '../new-dtos/update-project.dto';
import { AddMemberDto } from '../new-dtos/add-member.dto';
import { UpdateMilestoneDto } from '../new-dtos/update-milestone.dto';

@Injectable()

export class ProjectsRepository {



  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
  ) {}



  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const projectData = {
      ...createProjectDto,
      ownerId: new Types.ObjectId(createProjectDto.ownerId),
      members: createProjectDto.members?.map(member => ({
        ...member,
        userId: new Types.ObjectId(member.userId),
        joinedAt: new Date(),
        isActive: true,
      })) || [],
      settings: {
        allowPublicAccess: false,
        requireApprovalForTasks: false,
        enableTimeTracking: true,
        enableBudgetTracking: true,
        ...createProjectDto.settings,
      },
    };

    const newProject = new this.projectModel(projectData);
    return newProject.save();
  }

  async findAll(): Promise<Project[]> {
    return this.projectModel.find({ isActive: true }).exec();
  }

  async findById(id: string): Promise<Project | null> {
    return this.projectModel.findById(id).exec();
  }

  async update(id: string, updateProjectDto: any): Promise<Project | null> {
    const updateData = { ...updateProjectDto };
    if (!updateData.ownerId){

    }
    
  
    if (updateData.ownerId) {
      updateData.ownerId = updateData.ownerId;
    }
    if (updateData.members) {
      updateData.members = updateData.members.map(member => ({
        ...member,
        joinedAt: new Date(),
        isActive: true,
      }));
    }
    
    return this.projectModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async remove(id: string): Promise<Project | null> {
    return this.projectModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    ).exec();
  }

  async findByOwnerId(ownerId: string): Promise<Project[]> {
    return this.projectModel.find({
      ownerId: new Types.ObjectId(ownerId),
      isActive: true,
    }).exec();
  }

  async findByMemberId(memberId: string): Promise<Project[]> {


    return this.projectModel.find({

      'members.userId': new Types.ObjectId(memberId),
      'members.isActive': true,
      isActive: true,
    }).exec();
  }

  async findByStatus(status: ProjectStatus): Promise<Project[]> {
    return this.projectModel.find({ status, isActive: true }).exec();
  }

  async findByTags(tags: string[]): Promise<Project[]> {
    return this.projectModel.find({
      tags: { $in: tags },
      isActive: true,
    }).exec();
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Project[]> {
    return this.projectModel.find({
      $or: [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } },
        { startDate: { $lte: startDate }, endDate: { $gte: endDate } },
      ],
      isActive: true,
    }).exec();
  }

  async addMember(projectId: string, memberData: AddMemberDto): Promise<Project | null> {
    const member: ProjectMember = {
        userId: new Types.ObjectId(memberData.userId),
        role: memberData.role,
        joinedAt: new Date(),
        isActive: true,
    } as unknown as ProjectMember;

    return this.projectModel.findByIdAndUpdate(

      projectId,
      { $push: { members: member } },
      { new: true },
    ).exec();
  }

  async removeMember(projectId: string, userId: string): Promise<Project | null> {



    return this.projectModel.findByIdAndUpdate(
        
      projectId,
      { $pull: { members: { userId: new Types.ObjectId(userId) } } },
      { new: true },
    ).exec();
  }

  async updateMemberRole(projectId: string, userId: string, role: string): Promise<Project | null> {



    return this.projectModel.findOneAndUpdate(
      { _id: projectId, 'members.userId': new Types.ObjectId(userId) },
      { $set: { 'members.$.role': role } },
      { new: true },
    ).exec();
  }

  async addMilestone(projectId: string, milestone: ProjectMilestone): Promise<Project | null> {



    return this.projectModel.findByIdAndUpdate(
      projectId,
      { $push: { milestones: milestone } },
      { new: true },
    ).exec();
  }

  async updateMilestone(
    projectId: string,
    milestoneIndex: number,
    updateData: UpdateMilestoneDto,
  ): Promise<Project | null> {
    const updateFields = {};
    

    Object.keys(updateData).forEach(key => {


      if (updateData[key] !== undefined) {

        if (key === 'completedBy') {
          updateFields[`milestones.${milestoneIndex}.${key}`] = new Types.ObjectId(updateData[key]);
        } else if (key === 'isCompleted' && updateData[key]) {

          updateFields[`milestones.${milestoneIndex}.${key}`] = updateData[key];
          updateFields[`milestones.${milestoneIndex}.completedAt`] = new Date();

        } else {
          updateFields[`milestones.${milestoneIndex}.${key}`] = updateData[key];
        }
      }
    });

    return this.projectModel.findByIdAndUpdate(
      projectId,
      { $set: updateFields },
      { new: true },
    ).exec();
  }

  async removeMilestone(projectId: string, milestoneIndex: number): Promise<Project | null> {
    const project = await this.projectModel.findById(projectId);
    if (project && project.milestones[milestoneIndex]) {
      project.milestones.splice(milestoneIndex, 1);
      return project.save();
    }
    return project;
  }

  async updateProgress(projectId: string, progress: number): Promise<Project | null> {

    return this.projectModel.findByIdAndUpdate(
      projectId,
      { progress: Math.min(100, Math.max(0, progress)) },
      { new: true },
    ).exec();
  }

  async updateBudget(projectId: string, spentAmount: number): Promise<Project | null> {
    return this.projectModel.findByIdAndUpdate(
      projectId,
      { $inc: { spentBudget: spentAmount } },
      { new: true },
    ).exec();
  }

  async getProjectStats(projectId: string): Promise<any> {

    const project = await this.projectModel.findById(projectId);
    if (!project) return null;

    const totalMilestones = project.milestones.length;
    const completedMilestones = project.milestones.filter(m => m.isCompleted).length;
    const overdueMilestones = project.milestones.filter(
      m => !m.isCompleted && m.dueDate < new Date(),
    ).length;

    return {
      totalMembers: project.members.filter(m => m.isActive).length,
      totalMilestones,
      completedMilestones,
      overdueMilestones,
      budgetUtilization: project.budget > 0 ? (project.spentBudget / project.budget) * 100 : 0,
      progress: project.progress,
      daysRemaining: project.endDate ? Math.ceil((project.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null,
    };
  }

  async searchProjects(query: string): Promise<Project[]> {
    return this.projectModel.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } },
          ],
        },
      ],
    }).exec();
  }

  async getProjectsByPriority(): Promise<{ [key: string]: Project[] }> {
    const projects = await this.projectModel.find({ isActive: true }).exec();
    
    return projects.reduce((acc, project) => {
      if (!acc[project.priority]) {
        acc[project.priority] = [];
      }
      acc[project.priority].push(project);
      return acc;
    }, {});
  }

  async getOverdueProjects(): Promise<Project[]> {
    return this.projectModel.find({
      endDate: { $lt: new Date() },
      status: { $nin: [ProjectStatus.COMPLETED, ProjectStatus.CANCELLED] },
      isActive: true,
    }).exec();
  }
}