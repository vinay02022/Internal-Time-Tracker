export type UserRole = 'employee' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface TimeEntry {
  date: string;       // YYYY-MM-DD
  email: string;
  project: string;
  hours: 0.5 | 1;
  submittedAt: string; // ISO timestamp
}
