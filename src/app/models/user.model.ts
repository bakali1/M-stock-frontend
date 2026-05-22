export type UserRole = 'ADMIN' | 'PHARMACIAN' | 'VIEWER' | 'CLERK' | 'OFFICER';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  active: boolean;
  lastLogin?: string | null;
}
