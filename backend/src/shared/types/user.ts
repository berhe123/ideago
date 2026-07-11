import type { Role } from '../constants';
import type { AuthTokens } from './common';

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  headline?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthResultDto extends AuthTokens {
  user: UserDto;
}
