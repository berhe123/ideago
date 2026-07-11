import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Idea, IdeaStage, IdeaStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import {
  toBusinessModelDto,
  toDesignBriefDto,
  toProductPlanDto,
  toValidationDto,
} from '../blueprint/blueprint.mapper';
import { CreateIdeaDto, IdeaQueryDto, UpdateIdeaDto } from './dto/idea.dto';

@Injectable()
export class IdeaService {
  constructor(private readonly prisma: PrismaService) {}

  toDto(idea: Idea) {
    return {
      id: idea.id,
      ownerId: idea.ownerId,
      title: idea.title,
      problem: idea.problem,
      solution: idea.solution,
      targetMarket: idea.targetMarket,
      category: idea.category,
      stage: idea.stage,
      status: idea.status,
      startupScore: idea.startupScore,
      createdAt: idea.createdAt.toISOString(),
      updatedAt: idea.updatedAt.toISOString(),
    };
  }

  async create(userId: string, dto: CreateIdeaDto) {
    const idea = await this.prisma.idea.create({
      data: {
        ...dto,
        ownerId: userId,
        stage: IdeaStage.IDEA,
        status: IdeaStatus.SUBMITTED,
      },
    });
    return this.toDto(idea);
  }

  async list(userId: string, query: IdeaQueryDto) {
    const where: Prisma.IdeaWhereInput = {
      ownerId: userId,
      ...(query.stage ? { stage: query.stage as IdeaStage } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { problem: { contains: query.q, mode: 'insensitive' } },
              { category: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.idea.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.idea.count({ where }),
    ]);

    return paginate(items.map((i) => this.toDto(i)), total, query.page, query.pageSize);
  }

  /** Loads an idea and asserts the requester owns it (admins bypass). */
  async getOwned(userId: string, ideaId: string, isAdmin = false): Promise<Idea> {
    const idea = await this.prisma.idea.findUnique({ where: { id: ideaId } });
    if (!idea) throw new NotFoundException('Idea not found');
    if (idea.ownerId !== userId && !isAdmin) throw new ForbiddenException('Not your idea');
    return idea;
  }

  async detail(userId: string, ideaId: string, isAdmin = false) {
    await this.getOwned(userId, ideaId, isAdmin);
    const idea = await this.prisma.idea.findUniqueOrThrow({
      where: { id: ideaId },
      include: {
        validation: true,
        businessModel: true,
        productPlan: true,
        designBrief: true,
        project: { select: { id: true } },
      },
    });

    return {
      ...this.toDto(idea),
      hasProject: !!idea.project,
      blueprint: {
        validation: idea.validation ? toValidationDto(idea.validation) : null,
        businessModel: idea.businessModel ? toBusinessModelDto(idea.businessModel) : null,
        productPlan: idea.productPlan ? toProductPlanDto(idea.productPlan) : null,
        designBrief: idea.designBrief ? toDesignBriefDto(idea.designBrief) : null,
      },
    };
  }

  async update(userId: string, ideaId: string, dto: UpdateIdeaDto) {
    await this.getOwned(userId, ideaId);
    const idea = await this.prisma.idea.update({
      where: { id: ideaId },
      data: {
        ...dto,
        stage: dto.stage as IdeaStage | undefined,
        status: dto.status as IdeaStatus | undefined,
      },
    });
    return this.toDto(idea);
  }

  async remove(userId: string, ideaId: string) {
    await this.getOwned(userId, ideaId);
    await this.prisma.idea.delete({ where: { id: ideaId } });
    return { deleted: true };
  }
}
