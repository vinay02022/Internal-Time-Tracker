export type UserRole = 'employee' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface TimeEntry {
  entryId: string;    // UUID
  email: string;
  project: string;
  date: string;       // YYYY-MM-DD
  hours: 0.5 | 1;
  timestamp: string;  // ISO timestamp
}
