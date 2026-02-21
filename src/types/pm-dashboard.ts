// PM Dashboard 相关类型定义

export type ProjectStatus = 'active' | 'archived' | 'draft';

export type ProjectView = 'workspace' | 'file-records' | 'feature-list' | 'detailed-specs';

export type WorkflowStep = 1 | 2 | 3 | 4;

export type ChatMessageRole = 'user' | 'assistant';

export type ArtifactType = 'prd' | 'prototype';

export type LogicFlagCategory = 'permissions' | 'import-export' | 'hierarchy' | 'data-flow';

export type LogicFlagSeverity = 'warning' | 'critical' | 'info';

export type UploadedFileType = 'audio' | 'text';

export type UploadedFileStatus = 'uploading' | 'processing' | 'ready';

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

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: UploadedFileType;
  status: UploadedFileStatus;
  progress: number;
}

export interface LogicFlag {
  id: string;
  category: LogicFlagCategory;
  severity: LogicFlagSeverity;
  message: string;
  source: string;
}
