// Enum value sets shared between API (Prisma) and Web. Keep values in sync with schema.prisma.

export const ROLE = {
  FOUNDER: 'FOUNDER',
  EXPERT: 'EXPERT',
  ADMIN: 'ADMIN',
} as const;
export type Role = (typeof ROLE)[keyof typeof ROLE];

export const IDEA_STAGE = {
  IDEA: 'IDEA',
  VALIDATION: 'VALIDATION',
  PLANNING: 'PLANNING',
  DESIGN: 'DESIGN',
  MVP: 'MVP',
  DEVELOPMENT: 'DEVELOPMENT',
  LAUNCH: 'LAUNCH',
  GROWTH: 'GROWTH',
} as const;
export type IdeaStage = (typeof IDEA_STAGE)[keyof typeof IDEA_STAGE];

export const STAGE_ORDER: IdeaStage[] = [
  'IDEA',
  'VALIDATION',
  'PLANNING',
  'DESIGN',
  'MVP',
  'DEVELOPMENT',
  'LAUNCH',
  'GROWTH',
];

export const IDEA_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  VALIDATED: 'VALIDATED',
  BUILDING: 'BUILDING',
  LAUNCHED: 'LAUNCHED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type IdeaStatus = (typeof IDEA_STATUS)[keyof typeof IDEA_STATUS];

export const EXPERT_CATEGORY = {
  DEVELOPER: 'DEVELOPER',
  DESIGNER: 'DESIGNER',
  PRODUCT_MANAGER: 'PRODUCT_MANAGER',
  MARKETING: 'MARKETING',
  AI_ENGINEER: 'AI_ENGINEER',
  CONSULTANT: 'CONSULTANT',
} as const;
export type ExpertCategory = (typeof EXPERT_CATEGORY)[keyof typeof EXPERT_CATEGORY];

export const TASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;
export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const TASK_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;
export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];

export const MILESTONE_STATUS = {
  PLANNED: 'PLANNED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
} as const;
export type MilestoneStatus = (typeof MILESTONE_STATUS)[keyof typeof MILESTONE_STATUS];

export const HIRE_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  COMPLETED: 'COMPLETED',
} as const;
export type HireStatus = (typeof HIRE_STATUS)[keyof typeof HIRE_STATUS];

export const NOTIFICATION_TYPE = {
  SYSTEM: 'SYSTEM',
  VALIDATION: 'VALIDATION',
  HIRE: 'HIRE',
  WORKSPACE: 'WORKSPACE',
} as const;
export type NotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export const EXPERT_CATEGORY_LABEL: Record<ExpertCategory, string> = {
  DEVELOPER: 'Developer',
  DESIGNER: 'Designer',
  PRODUCT_MANAGER: 'Product Manager',
  MARKETING: 'Marketing Strategist',
  AI_ENGINEER: 'AI Engineer',
  CONSULTANT: 'Startup Consultant',
};

export const STAGE_LABEL: Record<IdeaStage, string> = {
  IDEA: 'Idea',
  VALIDATION: 'Validation',
  PLANNING: 'Planning',
  DESIGN: 'Design',
  MVP: 'MVP',
  DEVELOPMENT: 'Development',
  LAUNCH: 'Launch',
  GROWTH: 'Growth',
};
