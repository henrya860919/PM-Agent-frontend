// src/constants/project.ts
// 專案狀態：後端 API 狀態與 UI 狀態對應、顯示用顏色

import type { ProjectStatus } from '@/types/pm-dashboard';

/** 後端專案狀態 → 前端 ProjectStatus（Sidebar / workspace store 共用） */
export const PROJECT_STATUS_BACKEND_TO_UI: Record<string, ProjectStatus> = {
  in_progress: 'active',
  completed: 'archived',
  cancelled: 'archived',
  on_hold: 'draft',
};

export const PROJECT_STATUS_DEFAULT_UI: ProjectStatus = 'active';

/** 專案狀態對應的 Badge 顏色（Sidebar 專案列） */
export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  active: 'bg-primary',
  draft: 'bg-muted-foreground',
  archived: 'bg-muted-foreground/40',
};
