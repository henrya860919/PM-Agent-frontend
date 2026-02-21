// src/types/file.ts

export type FileRecord = {
  id: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  extension: string | null;
  businessType: string;
  uploadedBy: {
    id: string;
    username: string;
    displayName: string;
  };
  createdAt: string;
  url: string;
  thumbnailUrl?: string;
};

export type FileListResponse = {
  files: FileRecord[];
  total: number;
  page: number;
  limit: number;
};

export type FileUploadResponse = {
  id: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
};

export type FileProcessingStatusResponse = {
  fileId: string;
  transcriptStatus: 'not_started' | 'processing' | 'completed' | 'failed';
  analysisStatus: 'not_started' | 'processing' | 'completed' | 'failed';
  overall: 'not_started' | 'processing' | 'completed' | 'failed';
  transcriptErrorMessage?: string | null;
  analysisErrorMessage?: string | null;
};

export type FileTranscriptResponse = {
  id: string;
  fileId: string;
  transcript: string;
  language: string | null;
  duration: number | null;
  wordCount: number | null;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FileAnalysisResponse = {
  id: string;
  fileId: string;
  summary: string | null;
  keyDecisions: unknown[] | null;
  risks: unknown[] | null;
  dependencies: unknown[] | null;
  logicFlags: Array<{
    id: string;
    category: string;
    severity: string;
    message: string;
    source: string;
  }> | null;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};
