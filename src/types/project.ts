// src/types/project.ts

export type ProjectStatus = 'in_progress' | 'completed' | 'cancelled' | 'on_hold';

export type User = {
  id: string;
  username: string;
  displayName: string;
};

export type Project = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: ProjectStatus;
  client: string | null;
  startDate: string | null;
  expectedEndDate: string | null;
  address: string | null;
  owner: User;
};

export type ProjectListItem = {
  id: string;
  name: string;
  code: string;
  status: ProjectStatus;
  address: string | null;
  createdAt: string;
  owner: User;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalAll: number;
  totalPages: number;
};

export type ProjectListResponse = {
  data: ProjectListItem[];
  pagination: Pagination;
};

export type CreateProjectRequest = {
  name: string;
  code: string;
  ownerId?: string;
  description?: string;
  address?: string;
  client?: string;
  startDate?: string;
  expectedEndDate?: string;
};

export type UpdateProjectRequest = {
  name?: string;
  code?: string;
  description?: string;
  status?: ProjectStatus;
  address?: string;
  client?: string;
  startDate?: string;
  expectedEndDate?: string;
  ownerId?: string;
};
