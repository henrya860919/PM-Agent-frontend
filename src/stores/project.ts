// src/stores/project.ts
import { projectApi } from '@/services/endpoints/project';
import type { CreateProjectRequest, Pagination, Project, ProjectListItem, ProjectListResponse, UpdateProjectRequest } from '@/types/project';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useProjectStore = defineStore('project', () => {
  const projects = ref<ProjectListItem[]>([]);
  const currentProject = ref<Project | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<Error | null>(null);
  const pagination = ref<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalAll: 0,
    totalPages: 0,
  });

  // 重置專案列表
  function resetProjects(): void {
    projects.value = [];
  }

  // 獲取專案列表
  async function fetchProjects(page?: number, limit?: number, search?: string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      if (page !== undefined) {
        pagination.value.page = page;
      }
      if (limit !== undefined) {
        pagination.value.limit = limit;
      }

      const params: { page?: number; limit?: number; search?: string } = {
        page: pagination.value.page,
        limit: pagination.value.limit,
      };
      if (search) {
        params.search = search;
      }

      const response: ProjectListResponse = await projectApi.list(params);
      projects.value = response.data;
      pagination.value = response.pagination;
    } catch (err) {
      resetProjects();
      error.value = err instanceof Error ? err : new Error('獲取專案列表失敗');
    } finally {
      isLoading.value = false;
    }
  }

  // 獲取單一專案
  async function fetchProject(projectCode: string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      currentProject.value = await projectApi.get(projectCode);
    } catch (err) {
      currentProject.value = null;
      error.value = err instanceof Error ? err : new Error('獲取專案失敗');
    } finally {
      isLoading.value = false;
    }
  }

  // 建立新專案
  async function createProject(input: CreateProjectRequest): Promise<Project> {
    error.value = null;
    try {
      const newProject = await projectApi.create(input);
      // 重新載入專案列表
      await fetchProjects();
      return newProject;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('建立專案失敗');
      throw err;
    }
  }

  // 更新專案
  async function updateProject(projectCode: string, payload: UpdateProjectRequest): Promise<Project> {
    isLoading.value = true;
    error.value = null;
    try {
      const updatedProject = await projectApi.update(projectCode, payload);
      // 如果更新的是當前專案，更新 currentProject
      if (currentProject.value && currentProject.value.code === projectCode) {
        currentProject.value = updatedProject;
      }
      // 重新載入專案列表
      await fetchProjects();
      return updatedProject;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('更新專案失敗');
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // 刪除專案
  async function deleteProject(projectCode: string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      await projectApi.delete(projectCode);
      // 如果刪除的是當前專案，清空 currentProject
      if (currentProject.value && currentProject.value.code === projectCode) {
        currentProject.value = null;
      }
      // 重新載入專案列表
      await fetchProjects();
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('刪除專案失敗');
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    // States
    projects,
    currentProject,
    isLoading,
    error,
    pagination,

    // Actions
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    resetProjects,
  };
});
