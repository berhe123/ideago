import { Injectable } from '@nestjs/common';
import { Notification, NotificationType } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

interface CreateNotification {
  type: keyof typeof NotificationType;
  title: string;
  body: string;
  link?: string;
}

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  private toDto(n: Notification) {
    return {
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      read: n.read,
      link: n.link,
      createdAt: n.createdAt.toISOString(),
    };
  }

  async create(userId: string, input: CreateNotification) {
    const n = await this.prisma.notification.create({
      data: {
        userId,
        type: input.type as NotificationType,
        title: input.title,
        body: input.body,
        link: input.link,
      },
    });
    return this.toDto(n);
  }

  async list(userId: string) {
    const items = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const unread = items.filter((n) => !n.read).length;
    return { items: items.map((n) => this.toDto(n)), unread };
  }

  async markRead(userId: string, id: string) {
    await this.prisma.notification.updateMany({ where: { id, userId }, data: { read: true } });
    return { success: true };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
    return { success: true };
  }
}
