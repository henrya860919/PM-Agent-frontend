// src/services/endpoints/project.ts
import type { CreateProjectRequest, Project, ProjectListResponse, UpdateProjectRequest } from '@/types/project';
import apiClient from '../client';

export const projectApi = {
  /**
   * 獲取專案列表
   * GET /projects
   */
  async list(params?: { page?: number; limit?: number; search?: string }): Promise<ProjectListResponse> {
    const { data } = await apiClient.get('/projects', { params });
    return data;
  },

  /**
   * 獲取單一專案
   * GET /projects/{projectCode}
   */
  async get(projectCode: string): Promise<Project> {
    const { data } = await apiClient.get(`/projects/${projectCode}`);
    return data;
  },

  /**
   * 建立新專案
   * POST /projects
   */
  async create(input: CreateProjectRequest): Promise<Project> {
    const { data } = await apiClient.post('/projects', input);
    return data;
  },

  /**
   * 更新專案
   * PUT /projects/{projectCode}
   */
  async update(projectCode: string, payload: UpdateProjectRequest): Promise<Project> {
    const { data } = await apiClient.put(`/projects/${projectCode}`, payload);
    return data;
  },

  /**
   * 刪除專案
   * DELETE /projects/{projectCode}
   */
  async delete(projectCode: string): Promise<void> {
    await apiClient.delete(`/projects/${projectCode}`);
  },
};
