// PM Dashboard 相关类型定义

export type ProjectStatus = 'active' | 'archived' | 'draft';

export type ProjectView = 'workspace' | 'file-records' | 'feature-list' | 'detailed-specs';

export type WorkflowStep = 1 | 2 | 3 | 4;

export type ChatMessageRole = 'user' | 'assistant';

export type ArtifactType = 'prd' | 'prototype';

export type LogicFlagCategory = 'permissions' | 'import-export' | 'hierarchy' | 'data-flow';

export type LogicFlagSeverity = 'warning' | 'critical' | 'info';

export type UploadedFileType = 'audio' | 'text';

export type UploadedFileStatus = 'uploading' | 'processing' | 'ready' | 'error';

export interface UploadedFile {
  id: string;
  /** 後端檔案 ID（上傳成功後填入，用於輪詢轉錄/分析） */
  fileId?: string;
  name: string;
  size: string;
  type: UploadedFileType;
  status: UploadedFileStatus;
  progress: number;
  /** 轉錄/分析階段說明（例：轉錄中 1/2、分析中 2/2） */
  processingStep?: string;
  /** 失敗時後端回傳的錯誤訊息 */
  errorMessage?: string;
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp: Date;
  artifacts?: ChatArtifact[];
}

export interface ChatArtifact {
  type: ArtifactType;
  label: string;
}

export interface LogicFlag {
  id: string;
  category: LogicFlagCategory;
  severity: LogicFlagSeverity;
  message: string;
  source: string;
}
