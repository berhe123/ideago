import type { NotificationType } from '../constants';

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  link?: string | null;
  createdAt: string;
}
