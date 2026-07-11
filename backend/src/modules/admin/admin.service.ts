import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async stats() {
    const [
      totalUsers,
      totalFounders,
      totalExperts,
      totalIdeas,
      validatedIdeas,
      activeProjects,
      hireRequests,
      scoreAgg,
      byStage,
      recent,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.FOUNDER } }),
      this.prisma.expertProfile.count(),
      this.prisma.idea.count(),
      this.prisma.idea.count({ where: { status: { in: ['VALIDATED', 'BUILDING', 'LAUNCHED'] } } }),
      this.prisma.project.count(),
      this.prisma.hireRequest.count(),
      this.prisma.idea.aggregate({ _avg: { startupScore: true } }),
      this.prisma.idea.groupBy({
        by: ['stage'],
        orderBy: { stage: 'asc' },
        _count: { _all: true },
      }),
      this.prisma.idea.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { owner: { select: { firstName: true, lastName: true } } },
      }),
    ]);

    return {
      totalUsers,
      totalFounders,
      totalExperts,
      totalIdeas,
      validatedIdeas,
      activeProjects,
      hireRequests,
      avgStartupScore: Math.round(scoreAgg._avg.startupScore ?? 0),
      ideasByStage: byStage.map((s) => ({
        stage: s.stage,
        count: typeof s._count === 'object' && s._count ? s._count._all ?? 0 : 0,
      })),
      recentIdeas: recent.map((i) => ({
        id: i.id,
        title: i.title,
        owner: `${i.owner.firstName} ${i.owner.lastName}`.trim(),
        stage: i.stage,
        score: i.startupScore,
        createdAt: i.createdAt.toISOString(),
      })),
    };
  }

  async listUsers() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        _count: { select: { ideas: true } },
      },
    });
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: `${u.firstName} ${u.lastName}`.trim(),
      role: u.role,
      ideas: u._count.ideas,
      createdAt: u.createdAt.toISOString(),
    }));
  }

  async listIdeas() {
    const ideas = await this.prisma.idea.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { owner: { select: { firstName: true, lastName: true } } },
    });
    return ideas.map((i) => ({
      id: i.id,
      title: i.title,
      category: i.category,
      owner: `${i.owner.firstName} ${i.owner.lastName}`.trim(),
      stage: i.stage,
      status: i.status,
      score: i.startupScore,
      createdAt: i.createdAt.toISOString(),
    }));
  }

  async setUserRole(userId: string, role: Role) {
    const user = await this.prisma.user.update({ where: { id: userId }, data: { role } });
    return { id: user.id, role: user.role };
  }
}
