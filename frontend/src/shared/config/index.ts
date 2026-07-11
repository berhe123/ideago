export const config = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3003',
  appName: import.meta.env.VITE_APP_NAME ?? 'Ideago',
};

export const STAGES = [
  'IDEA',
  'VALIDATION',
  'PLANNING',
  'DESIGN',
  'MVP',
  'DEVELOPMENT',
  'LAUNCH',
  'GROWTH',
] as const;
