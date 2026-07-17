/* ─── User ─── */

export type User = {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  hasOdooConfig?: boolean;
  createdAt?: string;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissionCount: number;
};

export type Permission = {
  id: string;
  key: string;
  name: string;
  group: string;
};

export type PermissionGroup = Record<string, Permission[]>;

/* ─── Project ─── */

export type Project = {
  id: string;
  name: string;
  description?: string;
  odooId?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  users?: ProjectUser[];
};

export type ProjectUser = {
  id: string;
  name: string;
  email: string;
};

/* ─── Task ─── */

export type Task = {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  projectName?: string;
  stageId?: string;
  stageName?: string;
  odooId?: number;
  assignedTo?: string;
  deadline?: string;
  totalHours?: number;
};

export type Stage = {
  id: string;
  name: string;
  sequence: number;
};

/* ─── Timesheet ─── */

export type TimesheetEntry = {
  id: string;
  taskId: string;
  taskName: string;
  projectId: string;
  projectName: string;
  date: string;
  hours: number;
  description?: string;
};

/* ─── API ─── */

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type PaginatedResponse<T> = ApiResponse<T> & {
  total?: number;
  page?: number;
  perPage?: number;
};
