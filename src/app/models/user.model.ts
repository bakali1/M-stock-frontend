export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'PHARMACIAN';
  active: boolean;
}
