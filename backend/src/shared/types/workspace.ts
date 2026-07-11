import type { MilestoneStatus, TaskPriority, TaskStatus } from '../constants';

export interface ProjectDto {
  id: string;
  ideaId: string;
  name: string;
  summary: string;
  progress: number; // 0-100
  createdAt: string;
}

export interface TaskDto {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string | null;
  dueDate?: string | null;
  createdAt: string;
}

export interface MilestoneDto {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status: MilestoneStatus;
  dueDate?: string | null;
  createdAt: string;
}

export interface DocumentDto {
  id: string;
  projectId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectBoardDto {
  project: ProjectDto;
  tasks: TaskDto[];
  milestones: MilestoneDto[];
  documents: DocumentDto[];
}
