import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  ExpertCategory,
  ExpertProfile,
  HireRequest,
  HireStatus,
  Prisma,
  Role,
  User,
} from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import { NotificationService } from '../notification/notification.service';
import {
  CreateHireRequestDto,
  ExpertQueryDto,
  RespondHireDto,
  UpsertExpertDto,
} from './dto/marketplace.dto';

type ExpertWithUser = ExpertProfile & { user: User };

@Injectable()
export class MarketplaceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  private toExpertDto(e: ExpertWithUser) {
    return {
      id: e.id,
      userId: e.userId,
      fullName: `${e.user.firstName} ${e.user.lastName}`.trim(),
      avatarUrl: e.user.avatarUrl,
      category: e.category,
      headline: e.headline,
      bio: e.bio,
      skills: (e.skills as string[]) ?? [],
      hourlyRateUsd: e.hourlyRateUsd,
      rating: e.rating,
      reviewsCount: e.reviewsCount,
      available: e.available,
      location: e.location,
      createdAt: e.createdAt.toISOString(),
    };
  }

  async listExperts(query: ExpertQueryDto) {
    const where: Prisma.ExpertProfileWhereInput = {
      ...(query.category ? { category: query.category as ExpertCategory } : {}),
      ...(query.q
        ? {
            OR: [
              { headline: { contains: query.q, mode: 'insensitive' } },
              { bio: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.expertProfile.findMany({
        where,
        include: { user: true },
        orderBy: [{ available: 'desc' }, { rating: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.expertProfile.count({ where }),
    ]);

    return paginate(items.map((e) => this.toExpertDto(e)), total, query.page, query.pageSize);
  }

  async getExpert(id: string) {
    const expert = await this.prisma.expertProfile.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!expert) throw new NotFoundException('Expert not found');
    return this.toExpertDto(expert);
  }

  async myProfile(userId: string) {
    const expert = await this.prisma.expertProfile.findUnique({
      where: { userId },
      include: { user: true },
    });
    return expert ? this.toExpertDto(expert) : null;
  }

  async upsertProfile(userId: string, dto: UpsertExpertDto) {
    const data = {
      category: dto.category as ExpertCategory,
      headline: dto.headline,
      bio: dto.bio,
      skills: dto.skills,
      hourlyRateUsd: dto.hourlyRateUsd,
      location: dto.location,
      available: dto.available ?? true,
    };

    const expert = await this.prisma.expertProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
      include: { user: true },
    });

    // Promote founder to expert (admins keep their role).
    if (expert.user.role === Role.FOUNDER) {
      await this.prisma.user.update({ where: { id: userId }, data: { role: Role.EXPERT } });
    }

    return this.toExpertDto(expert);
  }

  private toHireDto(h: HireRequest & { expert?: ExpertWithUser; idea?: { title: string } | null }) {
    return {
      id: h.id,
      expertId: h.expertId,
      founderId: h.founderId,
      ideaId: h.ideaId,
      message: h.message,
      status: h.status,
      expert: h.expert ? this.toExpertDto(h.expert) : undefined,
      ideaTitle: h.idea?.title ?? null,
      createdAt: h.createdAt.toISOString(),
    };
  }

  async hire(userId: string, dto: CreateHireRequestDto) {
    const expert = await this.prisma.expertProfile.findUnique({
      where: { id: dto.expertId },
      include: { user: true },
    });
    if (!expert) throw new NotFoundException('Expert not found');
    if (expert.userId === userId) throw new ForbiddenException('You cannot hire yourself');

    if (dto.ideaId) {
      const idea = await this.prisma.idea.findUnique({ where: { id: dto.ideaId } });
      if (!idea || idea.ownerId !== userId) throw new ForbiddenException('Invalid idea');
    }

    const request = await this.prisma.hireRequest.create({
      data: {
        expertId: dto.expertId,
        founderId: userId,
        ideaId: dto.ideaId,
        message: dto.message,
      },
      include: { expert: { include: { user: true } }, idea: { select: { title: true } } },
    });

    await this.notifications.create(expert.userId, {
      type: 'HIRE',
      title: 'New hire request',
      body: `You have a new project request: "${dto.message.slice(0, 80)}"`,
      link: '/marketplace/requests',
    });

    return this.toHireDto(request);
  }

  async myHireRequests(userId: string) {
    const items = await this.prisma.hireRequest.findMany({
      where: { founderId: userId },
      include: { expert: { include: { user: true } }, idea: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((h) => this.toHireDto(h));
  }

  async incomingHireRequests(userId: string) {
    const expert = await this.prisma.expertProfile.findUnique({ where: { userId } });
    if (!expert) return [];
    const items = await this.prisma.hireRequest.findMany({
      where: { expertId: expert.id },
      include: { expert: { include: { user: true } }, idea: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((h) => this.toHireDto(h));
  }

  async respond(userId: string, requestId: string, dto: RespondHireDto) {
    const request = await this.prisma.hireRequest.findUnique({
      where: { id: requestId },
      include: { expert: true },
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.expert.userId !== userId) throw new ForbiddenException('Not your request');

    const updated = await this.prisma.hireRequest.update({
      where: { id: requestId },
      data: { status: dto.status as HireStatus },
      include: { expert: { include: { user: true } }, idea: { select: { title: true } } },
    });

    await this.notifications.create(request.founderId, {
      type: 'HIRE',
      title: `Hire request ${dto.status.toLowerCase()}`,
      body: `${updated.expert.user.firstName} ${dto.status.toLowerCase()} your request.`,
      link: '/marketplace/requests',
    });

    return this.toHireDto(updated);
  }
}
