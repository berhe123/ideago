import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  Document,
  IdeaStage,
  IdeaStatus,
  Milestone,
  MilestoneStatus,
  Project,
  Task,
  TaskPriority,
  TaskStatus,
} from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { IdeaService } from '../idea/idea.service';
import {
  CreateDocumentDto,
  CreateMilestoneDto,
  CreateTaskDto,
  UpdateDocumentDto,
  UpdateMilestoneDto,
  UpdateTaskDto,
} from './dto/workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ideas: IdeaService,
  ) {}

  // --- Mapping ---------------------------------------------------------------

  private projectProgress(tasks: Task[]): number {
    if (!tasks.length) return 0;
    const done = tasks.filter((t) => t.status === TaskStatus.DONE).length;
    return Math.round((done / tasks.length) * 100);
  }

  private toProjectDto(project: Project, tasks: Task[]) {
    return {
      id: project.id,
      ideaId: project.ideaId,
      name: project.name,
      summary: project.summary,
      progress: this.projectProgress(tasks),
      createdAt: project.createdAt.toISOString(),
    };
  }

  private toTaskDto(t: Task) {
    return {
      id: t.id,
      projectId: t.projectId,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      assignee: t.assignee,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      createdAt: t.createdAt.toISOString(),
    };
  }

  private toMilestoneDto(m: Milestone) {
    return {
      id: m.id,
      projectId: m.projectId,
      title: m.title,
      description: m.description,
      status: m.status,
      dueDate: m.dueDate ? m.dueDate.toISOString() : null,
      createdAt: m.createdAt.toISOString(),
    };
  }

  private toDocumentDto(d: Document) {
    return {
      id: d.id,
      projectId: d.projectId,
      title: d.title,
      content: d.content,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    };
  }

  // --- Project ---------------------------------------------------------------

  /** Resolves the project for an idea and asserts ownership. */
  private async getOwnedProject(userId: string, projectId: string): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { idea: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.idea.ownerId !== userId) throw new ForbiddenException('Not your project');
    return project;
  }

  async getOrCreateProject(userId: string, ideaId: string) {
    const idea = await this.ideas.getOwned(userId, ideaId);
    let project = await this.prisma.project.findUnique({ where: { ideaId } });

    if (!project) {
      project = await this.prisma.project.create({
        data: {
          ideaId,
          name: idea.title,
          summary: idea.solution.slice(0, 200),
          members: { create: { userId, role: 'OWNER' } },
        },
      });
      await this.seedFromBlueprint(project.id, ideaId);
      await this.prisma.idea.update({
        where: { id: ideaId },
        data: {
          status: IdeaStatus.BUILDING,
          stage: idea.stage === IdeaStage.IDEA ? IdeaStage.MVP : idea.stage,
        },
      });
    }

    return this.board(userId, project.id);
  }

  /** Seeds tasks, milestones and a PRD doc from the generated product plan (if any). */
  private async seedFromBlueprint(projectId: string, ideaId: string) {
    const plan = await this.prisma.productPlan.findUnique({ where: { ideaId } });

    if (plan) {
      const mvpScope = (plan.mvpScope as string[]) ?? [];
      if (mvpScope.length) {
        await this.prisma.task.createMany({
          data: mvpScope.map((title) => ({
            projectId,
            title,
            status: TaskStatus.TODO,
            priority: TaskPriority.HIGH,
          })),
        });
      }
      const roadmap = (plan.roadmap as { phase: string; timeframe: string }[]) ?? [];
      if (roadmap.length) {
        await this.prisma.milestone.createMany({
          data: roadmap.map((r, i) => ({
            projectId,
            title: `${r.phase} — ${r.timeframe}`,
            status: i === 0 ? MilestoneStatus.ACTIVE : MilestoneStatus.PLANNED,
          })),
        });
      }
      await this.prisma.document.create({
        data: {
          projectId,
          title: 'Product Requirements (PRD)',
          content: plan.prdSummary,
        },
      });
    } else {
      await this.prisma.task.createMany({
        data: [
          { projectId, title: 'Define the MVP scope', priority: TaskPriority.HIGH },
          { projectId, title: 'Talk to 5 target customers', priority: TaskPriority.HIGH },
          { projectId, title: 'Set up the project repo', priority: TaskPriority.MEDIUM },
        ],
      });
      await this.prisma.milestone.create({
        data: { projectId, title: 'MVP launch', status: MilestoneStatus.ACTIVE },
      });
    }
  }

  async board(userId: string, projectId: string) {
    const project = await this.getOwnedProject(userId, projectId);
    const [tasks, milestones, documents] = await Promise.all([
      this.prisma.task.findMany({ where: { projectId }, orderBy: { createdAt: 'asc' } }),
      this.prisma.milestone.findMany({ where: { projectId }, orderBy: { createdAt: 'asc' } }),
      this.prisma.document.findMany({ where: { projectId }, orderBy: { updatedAt: 'desc' } }),
    ]);

    return {
      project: this.toProjectDto(project, tasks),
      tasks: tasks.map((t) => this.toTaskDto(t)),
      milestones: milestones.map((m) => this.toMilestoneDto(m)),
      documents: documents.map((d) => this.toDocumentDto(d)),
    };
  }

  // --- Tasks -----------------------------------------------------------------

  async addTask(userId: string, projectId: string, dto: CreateTaskDto) {
    await this.getOwnedProject(userId, projectId);
    const task = await this.prisma.task.create({
      data: {
        projectId,
        title: dto.title,
        description: dto.description,
        priority: (dto.priority as TaskPriority) ?? TaskPriority.MEDIUM,
        assignee: dto.assignee,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });
    return this.toTaskDto(task);
  }

  async updateTask(userId: string, projectId: string, taskId: string, dto: UpdateTaskDto) {
    await this.getOwnedProject(userId, projectId);
    const task = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status as TaskStatus | undefined,
        priority: dto.priority as TaskPriority | undefined,
        assignee: dto.assignee,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
    return this.toTaskDto(task);
  }

  async deleteTask(userId: string, projectId: string, taskId: string) {
    await this.getOwnedProject(userId, projectId);
    await this.prisma.task.delete({ where: { id: taskId } });
    return { deleted: true };
  }

  // --- Milestones ------------------------------------------------------------

  async addMilestone(userId: string, projectId: string, dto: CreateMilestoneDto) {
    await this.getOwnedProject(userId, projectId);
    const milestone = await this.prisma.milestone.create({
      data: {
        projectId,
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });
    return this.toMilestoneDto(milestone);
  }

  async updateMilestone(
    userId: string,
    projectId: string,
    milestoneId: string,
    dto: UpdateMilestoneDto,
  ) {
    await this.getOwnedProject(userId, projectId);
    const milestone = await this.prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status as MilestoneStatus | undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
    return this.toMilestoneDto(milestone);
  }

  async deleteMilestone(userId: string, projectId: string, milestoneId: string) {
    await this.getOwnedProject(userId, projectId);
    await this.prisma.milestone.delete({ where: { id: milestoneId } });
    return { deleted: true };
  }

  // --- Documents -------------------------------------------------------------

  async addDocument(userId: string, projectId: string, dto: CreateDocumentDto) {
    await this.getOwnedProject(userId, projectId);
    const doc = await this.prisma.document.create({
      data: { projectId, title: dto.title, content: dto.content ?? '' },
    });
    return this.toDocumentDto(doc);
  }

  async updateDocument(
    userId: string,
    projectId: string,
    documentId: string,
    dto: UpdateDocumentDto,
  ) {
    await this.getOwnedProject(userId, projectId);
    const doc = await this.prisma.document.update({
      where: { id: documentId },
      data: { title: dto.title, content: dto.content },
    });
    return this.toDocumentDto(doc);
  }

  async deleteDocument(userId: string, projectId: string, documentId: string) {
    await this.getOwnedProject(userId, projectId);
    await this.prisma.document.delete({ where: { id: documentId } });
    return { deleted: true };
  }
}
